import { eq, desc, and } from 'drizzle-orm';
import { db } from './index.ts';
import {
  users,
  playerProfiles,
  characters,
  playerCharacters,
  items,
  playerInventories,
  gameRuns,
  scores,
  coinTransactions,
  missions,
  playerMissions,
} from './schema.ts';
import type { AuthUser } from '../middleware/auth.ts';

export async function getOrCreatePlayer(authUser: AuthUser) {
  try {
    let [user] = await db.select().from(users).where(eq(users.uid, authUser.uid)).limit(1);

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          uid: authUser.uid,
          email: authUser.email || null,
          username: authUser.username,
          isGuest: authUser.isGuest,
        })
        .returning();
      user = newUser;

      // Create profile
      await db.insert(playerProfiles).values({
        userId: user.id,
        totalCoins: 300, // Welcome gift
        bestScore: 0,
        totalDistance: 0,
        totalRunsPlayed: 0,
        currentCharacterId: 'runner-dash',
        currentBoardId: 'none',
      });

      // Unlock default character
      await db.insert(playerCharacters).values({
        userId: user.id,
        characterCode: 'runner-dash',
      });

      // Audit bonus
      await db.insert(coinTransactions).values({
        userId: user.id,
        amount: 300,
        balanceAfter: 300,
        type: 'starter_bonus',
        description: 'Starter welcome coins bonus',
      });

      // Initialize default missions
      const allMissions = await db.select().from(missions);
      for (const m of allMissions) {
        await db.insert(playerMissions).values({
          userId: user.id,
          missionCode: m.code,
          currentProgress: 0,
          completed: false,
          claimed: false,
        });
      }
    }

    const [profile] = await db
      .select()
      .from(playerProfiles)
      .where(eq(playerProfiles.userId, user.id))
      .limit(1);

    return { user, profile };
  } catch (error) {
    console.error('getOrCreatePlayer failed:', error);
    throw new Error('Failed to retrieve or create player profile', { cause: error });
  }
}

export async function getPlayerData(userId: number) {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    const unlockedChars = await db.select().from(playerCharacters).where(eq(playerCharacters.userId, userId));
    const inventory = await db.select().from(playerInventories).where(eq(playerInventories.userId, userId));
    const allCharacters = await db.select().from(characters);
    const allItems = await db.select().from(items);
    const allMissions = await db.select().from(missions);
    const playerMissionsList = await db.select().from(playerMissions).where(eq(playerMissions.userId, userId));

    return {
      user,
      profile,
      unlockedCharacters: unlockedChars.map((c) => c.characterCode),
      inventory,
      characters: allCharacters,
      items: allItems,
      missions: allMissions.map((m) => {
        const pm = playerMissionsList.find((p) => p.missionCode === m.code);
        return {
          ...m,
          currentProgress: pm ? pm.currentProgress : 0,
          completed: pm ? pm.completed : false,
          claimed: pm ? pm.claimed : false,
        };
      }),
    };
  } catch (error) {
    console.error('getPlayerData failed:', error);
    throw new Error('Failed to fetch player data', { cause: error });
  }
}

export async function submitGameRun(
  userId: number,
  runData: {
    score: number;
    distance: number;
    coinsCollected: number;
    durationSeconds: number;
    characterCode: string;
    deathReason?: string;
  }
) {
  try {
    // Basic anti-cheat validation
    const maxPlausibleCoins = Math.max(10, Math.floor(runData.distance * 0.8) + 50);
    const verifiedCoins = Math.min(Math.max(0, runData.coinsCollected), maxPlausibleCoins);
    const verifiedScore = Math.max(0, runData.score);
    const verifiedDistance = Math.max(0, runData.distance);
    const verifiedDuration = Math.max(1, runData.durationSeconds);

    const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    if (!profile) throw new Error('Profile not found');

    const newCoinBalance = profile.totalCoins + verifiedCoins;
    const newBestScore = Math.max(profile.bestScore, verifiedScore);
    const newTotalDistance = profile.totalDistance + verifiedDistance;
    const newTotalRuns = profile.totalRunsPlayed + 1;

    // Record run
    await db.insert(gameRuns).values({
      userId,
      score: verifiedScore,
      distance: verifiedDistance,
      coinsCollected: verifiedCoins,
      durationSeconds: verifiedDuration,
      characterCode: runData.characterCode || 'runner-dash',
      deathReason: runData.deathReason || 'collision',
    });

    // Record score for leaderboard
    await db.insert(scores).values({
      userId,
      score: verifiedScore,
      distance: verifiedDistance,
      coinsCollected: verifiedCoins,
    });

    // Update profile
    await db
      .update(playerProfiles)
      .set({
        totalCoins: newCoinBalance,
        bestScore: newBestScore,
        totalDistance: newTotalDistance,
        totalRunsPlayed: newTotalRuns,
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.userId, userId));

    // Audit coin transaction if coins collected
    if (verifiedCoins > 0) {
      await db.insert(coinTransactions).values({
        userId,
        amount: verifiedCoins,
        balanceAfter: newCoinBalance,
        type: 'run_reward',
        description: `Run reward (${verifiedDistance}m, score: ${verifiedScore})`,
      });
    }

    // Update missions
    const allMissions = await db.select().from(missions);
    for (const m of allMissions) {
      let [pm] = await db
        .select()
        .from(playerMissions)
        .where(and(eq(playerMissions.userId, userId), eq(playerMissions.missionCode, m.code)))
        .limit(1);

      if (!pm) {
        const [inserted] = await db
          .insert(playerMissions)
          .values({
            userId,
            missionCode: m.code,
            currentProgress: 0,
            completed: false,
            claimed: false,
          })
          .returning();
        pm = inserted;
      }

      if (!pm.completed) {
        let addedProgress = 0;
        if (m.targetType === 'distance') addedProgress = verifiedDistance;
        if (m.targetType === 'coins') addedProgress = verifiedCoins;
        if (m.targetType === 'score') addedProgress = verifiedScore;
        if (m.targetType === 'runs') addedProgress = 1;

        let newProgress = (m.targetType === 'score') 
          ? Math.max(pm.currentProgress, verifiedScore) 
          : pm.currentProgress + addedProgress;

        const isCompleted = newProgress >= m.targetValue;

        await db
          .update(playerMissions)
          .set({
            currentProgress: newProgress,
            completed: isCompleted,
            updatedAt: new Date(),
          })
          .where(eq(playerMissions.id, pm.id));
      }
    }

    return {
      newCoins: newCoinBalance,
      bestScore: newBestScore,
      totalDistance: newTotalDistance,
      totalRuns: newTotalRuns,
      coinsEarned: verifiedCoins,
    };
  } catch (error) {
    console.error('submitGameRun failed:', error);
    throw new Error('Failed to save game run', { cause: error });
  }
}

export async function buyCharacter(userId: number, characterCode: string) {
  try {
    const [character] = await db.select().from(characters).where(eq(characters.code, characterCode)).limit(1);
    if (!character) throw new Error('Character does not exist');

    const [existing] = await db
      .select()
      .from(playerCharacters)
      .where(and(eq(playerCharacters.userId, userId), eq(playerCharacters.characterCode, characterCode)))
      .limit(1);
    if (existing) throw new Error('Character is already unlocked');

    const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    if (!profile) throw new Error('Player profile not found');

    if (profile.totalCoins < character.price) {
      throw new Error(`Insufficient coins. Need ${character.price}, have ${profile.totalCoins}`);
    }

    const newCoins = profile.totalCoins - character.price;

    await db
      .update(playerProfiles)
      .set({
        totalCoins: newCoins,
        currentCharacterId: characterCode,
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.userId, userId));

    await db.insert(playerCharacters).values({
      userId,
      characterCode,
    });

    await db.insert(coinTransactions).values({
      userId,
      amount: -character.price,
      balanceAfter: newCoins,
      type: 'shop_purchase',
      description: `Unlocked character: ${character.name}`,
    });

    return { success: true, newCoins, characterCode };
  } catch (error: any) {
    console.error('buyCharacter error:', error);
    throw new Error(error.message || 'Failed to purchase character', { cause: error });
  }
}

export async function buyItem(userId: number, itemCode: string) {
  try {
    const [item] = await db.select().from(items).where(eq(items.code, itemCode)).limit(1);
    if (!item) throw new Error('Item does not exist');

    const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    if (!profile) throw new Error('Player profile not found');

    if (profile.totalCoins < item.price) {
      throw new Error(`Insufficient coins. Need ${item.price}, have ${profile.totalCoins}`);
    }

    const newCoins = profile.totalCoins - item.price;

    const [existingInv] = await db
      .select()
      .from(playerInventories)
      .where(and(eq(playerInventories.userId, userId), eq(playerInventories.itemCode, itemCode)))
      .limit(1);

    if (existingInv) {
      await db
        .update(playerInventories)
        .set({
          quantity: existingInv.quantity + 1,
          updatedAt: new Date(),
        })
        .where(eq(playerInventories.id, existingInv.id));
    } else {
      await db.insert(playerInventories).values({
        userId,
        itemCode,
        quantity: 1,
        isEquipped: item.category === 'hoverboard',
      });
    }

    if (item.category === 'hoverboard') {
      await db
        .update(playerProfiles)
        .set({
          totalCoins: newCoins,
          currentBoardId: itemCode,
          updatedAt: new Date(),
        })
        .where(eq(playerProfiles.userId, userId));
    } else {
      await db
        .update(playerProfiles)
        .set({
          totalCoins: newCoins,
          updatedAt: new Date(),
        })
        .where(eq(playerProfiles.userId, userId));
    }

    await db.insert(coinTransactions).values({
      userId,
      amount: -item.price,
      balanceAfter: newCoins,
      type: 'shop_purchase',
      description: `Purchased item: ${item.name}`,
    });

    return { success: true, newCoins, itemCode };
  } catch (error: any) {
    console.error('buyItem error:', error);
    throw new Error(error.message || 'Failed to purchase item', { cause: error });
  }
}

export async function claimMission(userId: number, missionCode: string) {
  try {
    const [m] = await db.select().from(missions).where(eq(missions.code, missionCode)).limit(1);
    if (!m) throw new Error('Mission not found');

    const [pm] = await db
      .select()
      .from(playerMissions)
      .where(and(eq(playerMissions.userId, userId), eq(playerMissions.missionCode, missionCode)))
      .limit(1);

    if (!pm || !pm.completed) throw new Error('Mission is not completed yet');
    if (pm.claimed) throw new Error('Mission reward already claimed');

    const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.userId, userId)).limit(1);
    if (!profile) throw new Error('Profile not found');

    const newCoins = profile.totalCoins + m.rewardCoins;

    await db
      .update(playerProfiles)
      .set({
        totalCoins: newCoins,
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.userId, userId));

    await db
      .update(playerMissions)
      .set({
        claimed: true,
        updatedAt: new Date(),
      })
      .where(eq(playerMissions.id, pm.id));

    await db.insert(coinTransactions).values({
      userId,
      amount: m.rewardCoins,
      balanceAfter: newCoins,
      type: 'mission_reward',
      description: `Reward for mission: ${m.title}`,
    });

    return { success: true, rewardCoins: m.rewardCoins, newCoins };
  } catch (error: any) {
    console.error('claimMission error:', error);
    throw new Error(error.message || 'Failed to claim mission reward', { cause: error });
  }
}

export async function selectCharacter(userId: number, characterCode: string) {
  try {
    const [unlocked] = await db
      .select()
      .from(playerCharacters)
      .where(and(eq(playerCharacters.userId, userId), eq(playerCharacters.characterCode, characterCode)))
      .limit(1);

    if (!unlocked) throw new Error('Character is locked. Unlock it in the shop first!');

    await db
      .update(playerProfiles)
      .set({
        currentCharacterId: characterCode,
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.userId, userId));

    return { success: true, currentCharacterId: characterCode };
  } catch (error: any) {
    console.error('selectCharacter error:', error);
    throw new Error(error.message || 'Failed to select character', { cause: error });
  }
}

export async function selectBoard(userId: number, boardCode: string) {
  try {
    if (boardCode !== 'none') {
      const [inv] = await db
        .select()
        .from(playerInventories)
        .where(and(eq(playerInventories.userId, userId), eq(playerInventories.itemCode, boardCode)))
        .limit(1);

      if (!inv || inv.quantity <= 0) {
        throw new Error('Board not in inventory. Purchase one in the Shop!');
      }
    }

    await db
      .update(playerProfiles)
      .set({
        currentBoardId: boardCode,
        updatedAt: new Date(),
      })
      .where(eq(playerProfiles.userId, userId));

    return { success: true, currentBoardId: boardCode };
  } catch (error: any) {
    console.error('selectBoard error:', error);
    throw new Error(error.message || 'Failed to select board', { cause: error });
  }
}

export async function getGlobalLeaderboard(limit = 25) {
  try {
    // Get highest score per user or all top scores
    const topScores = await db
      .select({
        id: scores.id,
        score: scores.score,
        distance: scores.distance,
        coins: scores.coinsCollected,
        createdAt: scores.createdAt,
        userId: users.id,
        username: users.username,
        isGuest: users.isGuest,
      })
      .from(scores)
      .innerJoin(users, eq(scores.userId, users.id))
      .orderBy(desc(scores.score))
      .limit(limit);

    return topScores;
  } catch (error) {
    console.error('getGlobalLeaderboard error:', error);
    return [];
  }
}

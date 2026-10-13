import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or guest UID
  email: text('email'),
  username: text('username').notNull(),
  avatar: text('avatar'),
  isGuest: boolean('is_guest').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Player profile holding progress and balances
export const playerProfiles = pgTable('player_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull().unique(),
  totalCoins: integer('total_coins').default(250).notNull(),
  bestScore: integer('best_score').default(0).notNull(),
  totalDistance: integer('total_distance').default(0).notNull(),
  totalRunsPlayed: integer('total_runs_played').default(0).notNull(),
  currentCharacterId: text('current_character_id').default('runner-dash').notNull(),
  currentBoardId: text('current_board_id').default('none').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Characters roster
export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. runner-dash, cyber-jax, nova-blade, mecha-rex
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').default(0).notNull(),
  colorTheme: text('color_theme').notNull(),
  speedMultiplier: integer('speed_multiplier').default(100).notNull(), // 100 = 1.0x, 110 = 1.1x
  isDefault: boolean('is_default').default(false).notNull(),
});

// Unlocked characters for players
export const playerCharacters = pgTable('player_characters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  characterCode: text('character_code').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// Shop items (hoverboards, power-ups, cosmetic skins)
export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'hoverboard', 'powerup', 'booster'
  price: integer('price').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
});

// Player inventory
export const playerInventories = pgTable('player_inventories', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  itemCode: text('item_code').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  isEquipped: boolean('is_equipped').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Detailed completed game runs
export const gameRuns = pgTable('game_runs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  score: integer('score').notNull(),
  distance: integer('distance').notNull(),
  coinsCollected: integer('coins_collected').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  characterCode: text('character_code').notNull(),
  deathReason: text('death_reason').default('collision').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Global leaderboard high scores
export const scores = pgTable('scores', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  score: integer('score').notNull(),
  distance: integer('distance').notNull(),
  coinsCollected: integer('coins_collected').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Coin transactions for audit trail and tamper prevention
export const coinTransactions = pgTable('coin_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(), // positive for earnings, negative for purchases
  balanceAfter: integer('balance_after').notNull(),
  type: text('type').notNull(), // 'run_reward', 'shop_purchase', 'mission_reward', 'starter_bonus'
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Missions available
export const missions = pgTable('missions', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // 'daily' or 'weekly'
  targetType: text('target_type').notNull(), // 'coins', 'distance', 'score', 'runs'
  targetValue: integer('target_value').notNull(),
  rewardCoins: integer('reward_coins').notNull(),
});

// Player mission progress
export const playerMissions = pgTable('player_missions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  missionCode: text('mission_code').notNull(),
  currentProgress: integer('current_progress').default(0).notNull(),
  completed: boolean('completed').default(false).notNull(),
  claimed: boolean('claimed').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(playerProfiles, {
    fields: [users.id],
    references: [playerProfiles.userId],
  }),
  runs: many(gameRuns),
  scores: many(scores),
  characters: many(playerCharacters),
  inventory: many(playerInventories),
  transactions: many(coinTransactions),
  missions: many(playerMissions),
}));

export const playerProfilesRelations = relations(playerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [playerProfiles.userId],
    references: [users.id],
  }),
}));

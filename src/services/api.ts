import { auth } from '../lib/firebase.ts';
import type { LeaderboardEntry } from '../types/game.ts';

const GUEST_KEY = 'cityrush_guest_id';

export function getGuestId(): string {
  let guestId = localStorage.getItem(GUEST_KEY);
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(GUEST_KEY, guestId);
  }
  return guestId;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn('Failed to get auth token:', e);
    }
  }

  // Always send guest ID as backup/identifier
  headers['x-guest-id'] = getGuestId();

  return headers;
}

export async function fetchPlayerData() {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/players/me', { headers });
  if (!res.ok) throw new Error('Failed to fetch player data');
  return res.json();
}

export async function submitRunScore(runData: {
  score: number;
  distance: number;
  coinsCollected: number;
  durationSeconds: number;
  characterCode: string;
  deathReason?: string;
}) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/scores', {
    method: 'POST',
    headers,
    body: JSON.stringify(runData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit score');
  }
  return res.json();
}

export async function buyCharacterApi(characterCode: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/shop/buy-character', {
    method: 'POST',
    headers,
    body: JSON.stringify({ characterCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to purchase character');
  }
  return res.json();
}

export async function buyItemApi(itemCode: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/shop/buy-item', {
    method: 'POST',
    headers,
    body: JSON.stringify({ itemCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to purchase item');
  }
  return res.json();
}

export async function updatePlayerSettings(settings: { characterCode?: string; boardCode?: string }) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/players/me', {
    method: 'PATCH',
    headers,
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update player');
  }
  return res.json();
}

export async function claimMissionApi(missionCode: string) {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/missions/claim', {
    method: 'POST',
    headers,
    body: JSON.stringify({ missionCode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to claim mission');
  }
  return res.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch('/api/leaderboard');
  if (!res.ok) throw new Error('Failed to load leaderboard');
  return res.json();
}

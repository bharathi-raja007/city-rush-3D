export const LANES = [-2.4, 0, 2.4] as const;
export const LANE_WIDTH = 2.4;

export const GAME_CONSTANTS = {
  BASE_SPEED: 22,
  MAX_SPEED: 46,
  SPEED_ACCEL: 0.25, // meters/sec increase per 100 meters
  JUMP_VELOCITY: 12.8,
  GRAVITY: -34.0,
  SLIDE_TIME: 0.8, // seconds
  MAGNET_RADIUS: 9.0,
  CHUNK_LENGTH: 65,
  VISIBLE_CHUNKS: 5,
  CAMERA_OFFSET_Y: 3.8,
  CAMERA_OFFSET_Z: 6.8,
  CAMERA_LOOK_Y: 1.8,
  JETPACK_HEIGHT: 6.5,
};

export interface ObstacleData {
  id: string;
  type: 'train' | 'barrier_high' | 'barrier_low' | 'hazard_block';
  lane: number; // -1, 0, 1
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  speedZ?: number; // for moving trains
}

export interface CollectibleData {
  id: string;
  type: 'coin' | 'magnet' | 'jetpack' | 'multiplier' | 'hoverboard';
  lane: number;
  x: number;
  y: number;
  z: number;
  collected?: boolean;
}

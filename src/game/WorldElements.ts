import * as THREE from 'three';
import { LANES, LANE_WIDTH } from './constants.ts';

// Shared materials for performance and batching
export const materials = {
  ground: new THREE.MeshStandardMaterial({
    color: 0x1e2230,
    roughness: 0.8,
    metalness: 0.1,
  }),
  railTrack: new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.85,
    roughness: 0.3,
  }),
  railGlow: new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  }),
  sleeper: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
  }),
  curb: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.5,
  }),
  coinGold: new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.8,
    roughness: 0.15,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
  }),
  trainBody: new THREE.MeshStandardMaterial({
    color: 0xef4444, // Vibrant crimson subway train
    metalness: 0.5,
    roughness: 0.25,
  }),
  trainRoof: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.6,
    roughness: 0.4,
  }),
  trainWindow: new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
  }),
  trainLight: new THREE.MeshBasicMaterial({
    color: 0xffffff,
  }),
  barrierYellow: new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4,
  }),
  barrierStripe: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.5,
  }),
  buildingMat: new THREE.MeshStandardMaterial({
    color: 0x090d16,
    roughness: 0.9,
  }),
  buildingWindowMat: new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
  }),
  powerupMagnet: new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0xef4444,
    emissiveIntensity: 0.4,
  }),
  powerupJetpack: new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0x0891b2,
    emissiveIntensity: 0.4,
  }),
  powerupMultiplier: new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    metalness: 0.6,
    roughness: 0.3,
    emissive: 0x9333ea,
    emissiveIntensity: 0.4,
  }),
  powerupBoard: new THREE.MeshStandardMaterial({
    color: 0x10b981,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0x059669,
    emissiveIntensity: 0.4,
  }),
};

// 1. Create Track Chunk (Length: 65m)
export function createTrackChunkMesh(chunkLength: number = 65): THREE.Group {
  const group = new THREE.Group();

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(LANE_WIDTH * 3 + 4, chunkLength);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMesh = new THREE.Mesh(groundGeo, materials.ground);
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // Railroad rails for all 3 lanes
  LANES.forEach((laneX) => {
    // 2 steel rails per lane
    const railOffset = 0.7;
    [-railOffset, railOffset].forEach((dx) => {
      const railGeo = new THREE.BoxGeometry(0.12, 0.15, chunkLength);
      const railMesh = new THREE.Mesh(railGeo, materials.railTrack);
      railMesh.position.set(laneX + dx, 0.08, 0);
      group.add(railMesh);

      // Glowing neon center track line
      const neonGeo = new THREE.BoxGeometry(0.04, 0.02, chunkLength);
      const neonMesh = new THREE.Mesh(neonGeo, materials.railGlow);
      neonMesh.position.set(laneX + dx, 0.16, 0);
      group.add(neonMesh);
    });

    // Sleepers (ties) every 2.5 meters
    const numSleepers = Math.floor(chunkLength / 2.5);
    for (let i = 0; i < numSleepers; i++) {
      const zPos = -chunkLength / 2 + i * 2.5 + 1.25;
      const sleeperGeo = new THREE.BoxGeometry(1.7, 0.08, 0.4);
      const sleeper = new THREE.Mesh(sleeperGeo, materials.sleeper);
      sleeper.position.set(laneX, 0.04, zPos);
      group.add(sleeper);
    }
  });

  // Track Curbs / Borders
  const curbGeo = new THREE.BoxGeometry(0.35, 0.35, chunkLength);
  const leftCurb = new THREE.Mesh(curbGeo, materials.curb);
  leftCurb.position.set(-LANE_WIDTH * 1.5 - 0.3, 0.18, 0);
  group.add(leftCurb);

  const rightCurb = new THREE.Mesh(curbGeo, materials.curb);
  rightCurb.position.set(LANE_WIDTH * 1.5 + 0.3, 0.18, 0);
  group.add(rightCurb);

  // Side Buildings / City Silhouette
  const buildingWidth = 8;
  const numBuildings = Math.floor(chunkLength / 16);
  for (let i = 0; i < numBuildings; i++) {
    const zPos = -chunkLength / 2 + i * 16 + 8;
    const heightLeft = 25 + Math.random() * 30;
    const heightRight = 25 + Math.random() * 30;

    // Left building
    const bLeftGeo = new THREE.BoxGeometry(buildingWidth, heightLeft, 14);
    const bLeft = new THREE.Mesh(bLeftGeo, materials.buildingMat);
    bLeft.position.set(-10 - buildingWidth / 2, heightLeft / 2, zPos);
    group.add(bLeft);

    // Left building window grids
    const winGeo = new THREE.BoxGeometry(0.2, 0.4, 0.6);
    const winMesh = new THREE.Mesh(winGeo, materials.buildingWindowMat);
    winMesh.position.set(-9.9, heightLeft * 0.6, zPos);
    group.add(winMesh);

    // Right building
    const bRightGeo = new THREE.BoxGeometry(buildingWidth, heightRight, 14);
    const bRight = new THREE.Mesh(bRightGeo, materials.buildingMat);
    bRight.position.set(10 + buildingWidth / 2, heightRight / 2, zPos);
    group.add(bRight);
  }

  // Overhead street arch or neon sign every chunk
  const archGroup = new THREE.Group();
  archGroup.position.set(0, 0, 0);

  const pillarGeo = new THREE.BoxGeometry(0.4, 6.5, 0.4);
  const leftPillar = new THREE.Mesh(pillarGeo, materials.railTrack);
  leftPillar.position.set(-LANE_WIDTH * 1.5 - 0.4, 3.25, 0);
  archGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, materials.railTrack);
  rightPillar.position.set(LANE_WIDTH * 1.5 + 0.4, 3.25, 0);
  archGroup.add(rightPillar);

  const beamGeo = new THREE.BoxGeometry(LANE_WIDTH * 3 + 1.2, 0.5, 0.4);
  const beam = new THREE.Mesh(beamGeo, materials.railTrack);
  beam.position.set(0, 6.25, 0);
  archGroup.add(beam);

  // Neon banner text block
  const signGeo = new THREE.BoxGeometry(4.5, 0.8, 0.15);
  const signMesh = new THREE.Mesh(signGeo, materials.railGlow);
  signMesh.position.set(0, 5.5, 0);
  archGroup.add(signMesh);

  group.add(archGroup);

  return group;
}

// 2. Create Train Obstacle
export function createTrainMesh(length: number = 14): THREE.Group {
  const train = new THREE.Group();

  // Train Main Body
  const bodyGeo = new THREE.BoxGeometry(2.1, 3.2, length);
  const body = new THREE.Mesh(bodyGeo, materials.trainBody);
  body.position.y = 1.9;
  body.castShadow = true;
  train.add(body);

  // Train Roof
  const roofGeo = new THREE.BoxGeometry(2.15, 0.35, length);
  const roof = new THREE.Mesh(roofGeo, materials.trainRoof);
  roof.position.y = 3.6;
  train.add(roof);

  // Windshield on front (facing player)
  const windshieldGeo = new THREE.BoxGeometry(1.8, 0.9, 0.2);
  const windshield = new THREE.Mesh(windshieldGeo, materials.trainWindow);
  windshield.position.set(0, 2.5, length / 2 + 0.05);
  train.add(windshield);

  // Headlights
  const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 12);
  lightGeo.rotateX(Math.PI / 2);

  const leftLight = new THREE.Mesh(lightGeo, materials.trainLight);
  leftLight.position.set(-0.65, 1.2, length / 2 + 0.05);
  train.add(leftLight);

  const rightLight = new THREE.Mesh(lightGeo, materials.trainLight);
  rightLight.position.set(0.65, 1.2, length / 2 + 0.05);
  train.add(rightLight);

  // Side Windows
  const numSideWindows = Math.floor(length / 2.5);
  for (let i = 0; i < numSideWindows; i++) {
    const z = -length / 2 + 1.8 + i * 2.5;
    const sideWinGeo = new THREE.BoxGeometry(0.1, 0.7, 1.2);

    const winLeft = new THREE.Mesh(sideWinGeo, materials.trainWindow);
    winLeft.position.set(-1.06, 2.2, z);
    train.add(winLeft);

    const winRight = new THREE.Mesh(sideWinGeo, materials.trainWindow);
    winRight.position.set(1.06, 2.2, z);
    train.add(winRight);
  }

  return train;
}

// 3. Create High Barrier (Player must SLIDE under or switch lane)
export function createHighBarrierMesh(): THREE.Group {
  const barrier = new THREE.Group();

  // Posts
  const postGeo = new THREE.BoxGeometry(0.2, 3.2, 0.2);
  const leftPost = new THREE.Mesh(postGeo, materials.barrierYellow);
  leftPost.position.set(-1.0, 1.6, 0);
  leftPost.castShadow = true;
  barrier.add(leftPost);

  const rightPost = new THREE.Mesh(postGeo, materials.barrierYellow);
  rightPost.position.set(1.0, 1.6, 0);
  rightPost.castShadow = true;
  barrier.add(rightPost);

  // Overhead bar at y = 1.9 to 2.8 (head-level; requires sliding!)
  const topBarGeo = new THREE.BoxGeometry(2.2, 0.85, 0.25);
  const topBar = new THREE.Mesh(topBarGeo, materials.barrierYellow);
  topBar.position.set(0, 2.2, 0);
  topBar.castShadow = true;
  barrier.add(topBar);

  // Warning stripes
  const stripeGeo = new THREE.BoxGeometry(2.22, 0.25, 0.26);
  const stripe = new THREE.Mesh(stripeGeo, materials.barrierStripe);
  stripe.position.set(0, 2.2, 0);
  barrier.add(stripe);

  return barrier;
}

// 4. Create Low Barrier (Player must JUMP over or switch lane)
export function createLowBarrierMesh(): THREE.Group {
  const barrier = new THREE.Group();

  // Low hurdle (height: 0.85m; player jump easily clears it)
  const barGeo = new THREE.BoxGeometry(2.0, 0.4, 0.2);
  const bar = new THREE.Mesh(barGeo, materials.barrierYellow);
  bar.position.set(0, 0.65, 0);
  bar.castShadow = true;
  barrier.add(bar);

  // Base feet
  const footGeo = new THREE.BoxGeometry(0.3, 0.7, 0.8);
  const leftFoot = new THREE.Mesh(footGeo, materials.barrierStripe);
  leftFoot.position.set(-0.85, 0.35, 0);
  barrier.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, materials.barrierStripe);
  rightFoot.position.set(0.85, 0.35, 0);
  barrier.add(rightFoot);

  return barrier;
}

// 5. Create Hazard Concrete Block (Cannot jump or slide; MUST switch lanes)
export function createHazardBlockMesh(): THREE.Group {
  const hazard = new THREE.Group();

  const blockGeo = new THREE.BoxGeometry(2.1, 3.0, 1.4);
  const block = new THREE.Mesh(blockGeo, materials.railTrack);
  block.position.y = 1.5;
  block.castShadow = true;
  hazard.add(block);

  // Warning sign on front
  const signGeo = new THREE.BoxGeometry(1.4, 1.4, 0.1);
  const sign = new THREE.Mesh(signGeo, materials.barrierYellow);
  sign.position.set(0, 1.6, 0.72);
  hazard.add(sign);

  return hazard;
}

// 6. Create Collectible Coin Mesh
export function createCoinMesh(): THREE.Group {
  const coinGroup = new THREE.Group();

  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16);
  coinGeo.rotateX(Math.PI / 2);
  const coin = new THREE.Mesh(coinGeo, materials.coinGold);
  coin.castShadow = true;
  coinGroup.add(coin);

  // Inner star embossed
  const innerGeo = new THREE.BoxGeometry(0.25, 0.25, 0.16);
  const inner = new THREE.Mesh(innerGeo, materials.curb);
  inner.rotation.z = Math.PI / 4;
  coinGroup.add(inner);

  return coinGroup;
}

// 7. Create Power-Up Meshes
export function createPowerUpMesh(type: 'magnet' | 'jetpack' | 'multiplier' | 'hoverboard'): THREE.Group {
  const group = new THREE.Group();

  // Floating pedestal / halo ring
  const ringGeo = new THREE.TorusGeometry(0.65, 0.08, 8, 24);
  ringGeo.rotateX(Math.PI / 2);

  if (type === 'magnet') {
    const ring = new THREE.Mesh(ringGeo, materials.powerupMagnet);
    group.add(ring);

    // Horseshoe magnet
    const magnetGeo = new THREE.TorusGeometry(0.4, 0.12, 8, 16, Math.PI);
    const magnet = new THREE.Mesh(magnetGeo, materials.powerupMagnet);
    magnet.position.y = 0.1;
    group.add(magnet);
  } else if (type === 'jetpack') {
    const ring = new THREE.Mesh(ringGeo, materials.powerupJetpack);
    group.add(ring);

    // Double rocket cylinders
    const rocketGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.6, 12);
    const r1 = new THREE.Mesh(rocketGeo, materials.powerupJetpack);
    r1.position.set(-0.2, 0.1, 0);
    group.add(r1);

    const r2 = new THREE.Mesh(rocketGeo, materials.powerupJetpack);
    r2.position.set(0.2, 0.1, 0);
    group.add(r2);
  } else if (type === 'multiplier') {
    const ring = new THREE.Mesh(ringGeo, materials.powerupMultiplier);
    group.add(ring);

    // '2X' icosahedron star
    const starGeo = new THREE.IcosahedronGeometry(0.38, 0);
    const star = new THREE.Mesh(starGeo, materials.powerupMultiplier);
    star.position.y = 0.1;
    group.add(star);
  } else {
    // Hoverboard
    const ring = new THREE.Mesh(ringGeo, materials.powerupBoard);
    group.add(ring);

    const boardGeo = new THREE.BoxGeometry(0.35, 0.08, 0.9);
    const board = new THREE.Mesh(boardGeo, materials.powerupBoard);
    board.position.y = 0.1;
    group.add(board);
  }

  return group;
}

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore.ts';
import { audio } from '../services/audio.ts';
import {
  LANES,
  LANE_WIDTH,
  GAME_CONSTANTS,
  type ObstacleData,
  type CollectibleData,
} from './constants.ts';
import { CharacterModel } from './CharacterModel.ts';
import {
  createTrackChunkMesh,
  createTrainMesh,
  createHighBarrierMesh,
  createLowBarrierMesh,
  createHazardBlockMesh,
  createCoinMesh,
  createPowerUpMesh,
} from './WorldElements.ts';

export const GameCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameState = useGameStore((s) => s.gameState);
  const currentCharacterCode = useGameStore((s) => s.profile?.currentCharacterId || 'runner-dash');

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.012);

    const camera = new THREE.PerspectiveCamera(
      65,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.3);
    dirLight.position.set(15, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.camera.left = -15;
    dirLight.shadow.camera.right = 15;
    dirLight.shadow.camera.top = 15;
    dirLight.shadow.camera.bottom = -15;
    scene.add(dirLight);

    const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1e1b4b, 0.5);
    scene.add(hemiLight);

    // --- PLAYER INITIALIZATION ---
    let character = new CharacterModel(currentCharacterCode);
    scene.add(character.group);

    // Player State
    let currentLaneIndex = 1; // 0: Left, 1: Center, 2: Right
    let targetX = LANES[currentLaneIndex];
    let playerX = targetX;
    let playerY = 0;
    let velocityY = 0;
    let isJumping = false;
    let isSliding = false;
    let slideTimer = 0;
    let invulnerableTimer = 0;

    // Movement progress
    let playerZ = 0;
    let currentSpeed = GAME_CONSTANTS.BASE_SPEED;

    // --- TRACK CHUNKS ---
    const chunkLength = GAME_CONSTANTS.CHUNK_LENGTH;
    const chunkCount = GAME_CONSTANTS.VISIBLE_CHUNKS;
    const trackChunks: { group: THREE.Group; zPos: number }[] = [];

    for (let i = 0; i < chunkCount; i++) {
      const zPos = -(i * chunkLength);
      const chunkGroup = createTrackChunkMesh(chunkLength);
      chunkGroup.position.set(0, 0, zPos);
      scene.add(chunkGroup);
      trackChunks.push({ group: chunkGroup, zPos });
    }

    // --- OBSTACLES & COLLECTIBLES MANAGEMENT ---
    interface ActiveObstacle {
      data: ObstacleData;
      mesh: THREE.Group;
    }
    interface ActiveCollectible {
      data: CollectibleData;
      mesh: THREE.Group;
    }

    const activeObstacles: ActiveObstacle[] = [];
    const activeCollectibles: ActiveCollectible[] = [];

    // Helper to spawn obstacles for a chunk
    function populateChunk(chunkStartZ: number) {
      if (Math.abs(chunkStartZ) < 40) return; // Keep initial runway clean

      // Pattern 1: Moving Train on one lane
      const trainLane = Math.floor(Math.random() * 3);
      const trainZ = chunkStartZ - 20 - Math.random() * 20;

      const trainMesh = createTrainMesh(14);
      trainMesh.position.set(LANES[trainLane], 0, trainZ);
      scene.add(trainMesh);

      activeObstacles.push({
        data: {
          id: `train_${trainZ}`,
          type: 'train',
          lane: trainLane,
          x: LANES[trainLane],
          y: 1.6,
          z: trainZ,
          width: 2.1,
          height: 3.2,
          depth: 14,
          speedZ: 6.0, // Moving towards player
        },
        mesh: trainMesh,
      });

      // Pattern 2: Road hazards / High barriers on the other 2 lanes
      const otherLanes = [0, 1, 2].filter((l) => l !== trainLane);
      const chosenLane = otherLanes[Math.floor(Math.random() * otherLanes.length)];
      const obsZ = chunkStartZ - 35 - Math.random() * 15;

      const randType = Math.random();
      if (randType < 0.4) {
        // High barrier (requires sliding)
        const barrierMesh = createHighBarrierMesh();
        barrierMesh.position.set(LANES[chosenLane], 0, obsZ);
        scene.add(barrierMesh);
        activeObstacles.push({
          data: {
            id: `high_${obsZ}`,
            type: 'barrier_high',
            lane: chosenLane,
            x: LANES[chosenLane],
            y: 2.2,
            z: obsZ,
            width: 2.1,
            height: 0.9,
            depth: 0.3,
          },
          mesh: barrierMesh,
        });
      } else if (randType < 0.75) {
        // Low barrier (requires jumping)
        const lowMesh = createLowBarrierMesh();
        lowMesh.position.set(LANES[chosenLane], 0, obsZ);
        scene.add(lowMesh);
        activeObstacles.push({
          data: {
            id: `low_${obsZ}`,
            type: 'barrier_low',
            lane: chosenLane,
            x: LANES[chosenLane],
            y: 0.5,
            z: obsZ,
            width: 2.0,
            height: 0.8,
            depth: 0.5,
          },
          mesh: lowMesh,
        });

        // Spawn gold coins in an arc above low hurdle!
        for (let c = -2; c <= 2; c++) {
          const coinMesh = createCoinMesh();
          const cz = obsZ + c * 2.2;
          const cy = 1.0 + (1 - Math.abs(c) / 3) * 1.8;
          coinMesh.position.set(LANES[chosenLane], cy, cz);
          scene.add(coinMesh);
          activeCollectibles.push({
            data: {
              id: `coin_arc_${cz}_${chosenLane}`,
              type: 'coin',
              lane: chosenLane,
              x: LANES[chosenLane],
              y: cy,
              z: cz,
            },
            mesh: coinMesh,
          });
        }
      } else {
        // Hazard block (must switch lane)
        const blockMesh = createHazardBlockMesh();
        blockMesh.position.set(LANES[chosenLane], 0, obsZ);
        scene.add(blockMesh);
        activeObstacles.push({
          data: {
            id: `block_${obsZ}`,
            type: 'hazard_block',
            lane: chosenLane,
            x: LANES[chosenLane],
            y: 1.5,
            z: obsZ,
            width: 2.1,
            height: 3.0,
            depth: 1.4,
          },
          mesh: blockMesh,
        });
      }

      // Pattern 3: Straight line of coins on the remaining free lane
      const freeLane = [0, 1, 2].find((l) => l !== trainLane && l !== chosenLane) ?? 1;
      for (let i = 0; i < 5; i++) {
        const coinMesh = createCoinMesh();
        const cz = chunkStartZ - 15 - i * 3.5;
        coinMesh.position.set(LANES[freeLane], 1.0, cz);
        scene.add(coinMesh);
        activeCollectibles.push({
          data: {
            id: `coin_line_${cz}_${freeLane}`,
            type: 'coin',
            lane: freeLane,
            x: LANES[freeLane],
            y: 1.0,
            z: cz,
          },
          mesh: coinMesh,
        });
      }

      // Pattern 4: Power-Up Spawn (15% chance per chunk)
      if (Math.random() < 0.45) {
        const powerTypes: ('magnet' | 'jetpack' | 'multiplier' | 'hoverboard')[] = [
          'magnet',
          'jetpack',
          'multiplier',
          'hoverboard',
        ];
        const chosenPower = powerTypes[Math.floor(Math.random() * powerTypes.length)];
        const puMesh = createPowerUpMesh(chosenPower);
        const puLane = Math.floor(Math.random() * 3);
        const pz = chunkStartZ - 45;
        puMesh.position.set(LANES[puLane], 1.2, pz);
        scene.add(puMesh);
        activeCollectibles.push({
          data: {
            id: `pu_${pz}_${chosenPower}`,
            type: chosenPower,
            lane: puLane,
            x: LANES[puLane],
            y: 1.2,
            z: pz,
          },
          mesh: puMesh,
        });
      }
    }

    // Populate initial chunks
    trackChunks.forEach((c) => populateChunk(c.zPos));

    // --- CONTROLS / INPUT HANDLERS ---
    function moveLeft() {
      if (useGameStore.getState().gameState !== 'playing') return;
      if (currentLaneIndex > 0) {
        currentLaneIndex--;
        targetX = LANES[currentLaneIndex];
        audio.playClick();
      }
    }

    function moveRight() {
      if (useGameStore.getState().gameState !== 'playing') return;
      if (currentLaneIndex < 2) {
        currentLaneIndex++;
        targetX = LANES[currentLaneIndex];
        audio.playClick();
      }
    }

    function jump() {
      if (useGameStore.getState().gameState !== 'playing') return;
      if (!isJumping && !isSliding) {
        velocityY = GAME_CONSTANTS.JUMP_VELOCITY;
        isJumping = true;
        audio.playJump();
      }
    }

    function slide() {
      if (useGameStore.getState().gameState !== 'playing') return;
      if (isJumping) {
        // Fast drop if in mid-air
        velocityY = -18;
      }
      isSliding = true;
      slideTimer = GAME_CONSTANTS.SLIDE_TIME;
      audio.playSlide();
    }

    function activateHoverboard() {
      const state = useGameStore.getState();
      if (state.gameState !== 'playing') return;
      if (state.powerUps.hoverboard <= 0) {
        state.activatePowerUp('hoverboard', 25);
      }
    }

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        moveRight();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        slide();
      } else if (e.key === ' ') {
        e.preventDefault();
        activateHoverboard();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        const state = useGameStore.getState();
        if (state.gameState === 'playing') state.pauseRun();
        else if (state.gameState === 'paused') state.resumeRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Mobile swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTapTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        // Double tap check for hoverboard
        const now = Date.now();
        if (now - lastTapTime < 300) {
          activateHoverboard();
        }
        lastTapTime = now;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 25) {
          if (absX > absY) {
            if (dx > 0) moveRight();
            else moveLeft();
          } else {
            if (dy > 0) slide();
            else jump();
          }
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Visibility change handler (pause on tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden && useGameStore.getState().gameState === 'playing') {
        useGameStore.getState().pauseRun();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --- GAME LOOP ---
    let lastTime = performance.now();
    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const currentGameState = useGameStore.getState().gameState;
      const powerUps = useGameStore.getState().powerUps;

      if (currentGameState === 'menu') {
        // Rotating showcase in Menu
        character.group.position.set(0, 0, 0);
        character.group.rotation.y = currentTime * 0.0012;
        character.updateAnimation(currentTime * 0.001, {
          isRunning: false,
          isJumping: false,
          isSliding: false,
          hasJetpack: false,
          hasHoverboard: false,
          speedRatio: 1,
        });

        camera.position.set(0, 2.2, 4.8);
        camera.lookAt(0, 1.4, 0);

        renderer.render(scene, camera);
        return;
      }

      if (currentGameState !== 'playing') {
        renderer.render(scene, camera);
        return;
      }

      // --- RUNNING UPDATE ---
      // 1. Tick power-ups
      useGameStore.getState().tickPowerUps(deltaTime);

      // 2. Speed ramping
      const runDistance = Math.abs(playerZ);
      currentSpeed = Math.min(
        GAME_CONSTANTS.MAX_SPEED,
        GAME_CONSTANTS.BASE_SPEED + (runDistance / 100) * GAME_CONSTANTS.SPEED_ACCEL
      );

      // Advance player position forward along -Z
      const distDelta = currentSpeed * deltaTime;
      playerZ -= distDelta;
      useGameStore.getState().addDistance(distDelta);

      // 3. Smooth lane transition
      playerX += (targetX - playerX) * Math.min(1, deltaTime * 16);

      // 4. Vertical physics & Jetpack handling
      const hasJetpack = powerUps.jetpack > 0;
      const hasHoverboard = powerUps.hoverboard > 0;

      if (hasJetpack) {
        // Fly up smoothly
        playerY += (GAME_CONSTANTS.JETPACK_HEIGHT - playerY) * Math.min(1, deltaTime * 6);
        isJumping = false;
        isSliding = false;
      } else {
        // Normal Gravity
        if (isJumping) {
          playerY += velocityY * deltaTime;
          velocityY += GAME_CONSTANTS.GRAVITY * deltaTime;

          if (playerY <= 0) {
            playerY = 0;
            isJumping = false;
            velocityY = 0;
          }
        } else {
          playerY = 0;
        }

        // Slide timer
        if (isSliding) {
          slideTimer -= deltaTime;
          if (slideTimer <= 0) {
            isSliding = false;
          }
        }
      }

      // Update Character position and mesh animations
      character.group.position.set(playerX, playerY, playerZ);
      character.group.rotation.y = 0;
      // Slight tilt when changing lanes
      const laneVelocity = (targetX - playerX) * 0.15;
      character.group.rotation.z = -laneVelocity;

      character.updateAnimation(currentTime * 0.001, {
        isRunning: true,
        isJumping: isJumping && !hasJetpack,
        isSliding: isSliding && !hasJetpack,
        hasJetpack,
        hasHoverboard,
        speedRatio: currentSpeed / GAME_CONSTANTS.BASE_SPEED,
      });

      // Flashing if recently shielded
      if (invulnerableTimer > 0) {
        invulnerableTimer -= deltaTime;
        character.group.visible = Math.floor(currentTime / 80) % 2 === 0;
      } else {
        character.group.visible = true;
      }

      // 5. Camera follow
      const targetCamY = playerY + GAME_CONSTANTS.CAMERA_OFFSET_Y;
      const targetCamZ = playerZ + GAME_CONSTANTS.CAMERA_OFFSET_Z;

      camera.position.x += (playerX * 0.4 - camera.position.x) * Math.min(1, deltaTime * 8);
      camera.position.y += (targetCamY - camera.position.y) * Math.min(1, deltaTime * 6);
      camera.position.z = targetCamZ;

      camera.lookAt(
        playerX * 0.2,
        playerY * 0.5 + GAME_CONSTANTS.CAMERA_LOOK_Y,
        playerZ - 12
      );

      // Light follow
      dirLight.position.set(playerX + 15, playerY + 30, playerZ + 20);
      dirLight.target = character.group;

      // 6. Recyle track chunks
      trackChunks.forEach((chunk) => {
        if (chunk.group.position.z > playerZ + chunkLength) {
          // Find lowest z
          let minZ = 0;
          trackChunks.forEach((c) => {
            if (c.group.position.z < minZ) minZ = c.group.position.z;
          });
          const newZ = minZ - chunkLength;
          chunk.group.position.z = newZ;
          chunk.zPos = newZ;
          populateChunk(newZ);
        }
      });

      // 7. Update Obstacles (Moving trains & collision check)
      const playerBox = new THREE.Box3();
      const pHeight = isSliding ? 0.75 : 1.8;
      const pYMin = playerY;
      const pYMax = playerY + pHeight;

      playerBox.min.set(playerX - 0.35, pYMin, playerZ - 0.35);
      playerBox.max.set(playerX + 0.35, pYMax, playerZ + 0.35);

      for (let i = activeObstacles.length - 1; i >= 0; i--) {
        const obs = activeObstacles[i];

        // Move oncoming trains
        if (obs.data.speedZ) {
          obs.mesh.position.z += obs.data.speedZ * deltaTime;
          obs.data.z = obs.mesh.position.z;
        }

        // Clean up passed obstacles
        if (obs.mesh.position.z > playerZ + 25) {
          scene.remove(obs.mesh);
          activeObstacles.splice(i, 1);
          continue;
        }

        // Collision Check (skip if jetpack flying or invincible)
        if (!hasJetpack && invulnerableTimer <= 0) {
          const obsBox = new THREE.Box3();
          const halfW = obs.data.width / 2;
          const halfD = obs.data.depth / 2;

          let obsYMin = 0;
          let obsYMax = obs.data.height;

          if (obs.data.type === 'barrier_high') {
            // Player can slide under if their head is below 1.7m!
            obsYMin = 1.7;
            obsYMax = 2.8;
          }

          obsBox.min.set(obs.data.x - halfW, obsYMin, obs.data.z - halfD);
          obsBox.max.set(obs.data.x + halfW, obsYMax, obs.data.z + halfD);

          if (playerBox.intersectsBox(obsBox)) {
            // Collision triggered!
            if (hasHoverboard) {
              // Hoverboard shield absorbs the hit!
              useGameStore.getState().breakHoverboard();
              invulnerableTimer = 1.6; // 1.6s grace period
              // Push obstacle away or remove it
              scene.remove(obs.mesh);
              activeObstacles.splice(i, 1);
              continue;
            } else {
              // Game Over!
              useGameStore.getState().endRun(`hit_${obs.data.type}`);
              return;
            }
          }
        }
      }

      // 8. Update Collectibles & Magnet pulling
      const magnetActive = powerUps.magnet > 0;

      for (let i = activeCollectibles.length - 1; i >= 0; i--) {
        const col = activeCollectibles[i];

        // Rotation animation
        col.mesh.rotation.y = currentTime * 0.003;

        // Magnet attraction
        if (col.data.type === 'coin' && (magnetActive || hasJetpack)) {
          const dx = playerX - col.mesh.position.x;
          const dy = playerY + 1.0 - col.mesh.position.y;
          const dz = playerZ - col.mesh.position.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < GAME_CONSTANTS.MAGNET_RADIUS) {
            col.mesh.position.x += dx * Math.min(1, deltaTime * 12);
            col.mesh.position.y += dy * Math.min(1, deltaTime * 12);
            col.mesh.position.z += dz * Math.min(1, deltaTime * 12);
          }
        }

        // Clean up passed collectibles
        if (col.mesh.position.z > playerZ + 15) {
          scene.remove(col.mesh);
          activeCollectibles.splice(i, 1);
          continue;
        }

        // Check pickup distance
        const dx = playerX - col.mesh.position.x;
        const dy = playerY + 0.8 - col.mesh.position.y;
        const dz = playerZ - col.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 1.35) {
          // Collected!
          scene.remove(col.mesh);
          activeCollectibles.splice(i, 1);

          if (col.data.type === 'coin') {
            useGameStore.getState().collectCoin();
          } else {
            useGameStore.getState().activatePowerUp(col.data.type, 12);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [gameState, currentCharacterCode]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden select-none" />;
};

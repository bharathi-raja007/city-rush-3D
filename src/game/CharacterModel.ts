import * as THREE from 'three';

export interface CharacterVisualConfig {
  code: string;
  suitColor: number;
  accentColor: number;
  skinColor: number;
  hairColor: number;
  visorColor?: number;
}

export const CHARACTER_THEMES: Record<string, CharacterVisualConfig> = {
  'runner-dash': {
    code: 'runner-dash',
    suitColor: 0x2563eb, // Vibrant blue
    accentColor: 0x38bdf8, // Sky cyan
    skinColor: 0xf6d8ae,
    hairColor: 0x334155, // Dark slate
    visorColor: 0x06b6d4,
  },
  'cyber-jax': {
    code: 'cyber-jax',
    suitColor: 0x059669, // Emerald cyber green
    accentColor: 0x10b981, // Neon mint
    skinColor: 0xe0e7ff, // Cyber pale
    hairColor: 0x0f172a,
    visorColor: 0x34d399,
  },
  'nova-blade': {
    code: 'nova-blade',
    suitColor: 0xdb2777, // Electric pink
    accentColor: 0xf43f5e, // Hot rose
    skinColor: 0xfcd34d,
    hairColor: 0x7c3aed, // Purple hair
    visorColor: 0xf472b6,
  },
  'mecha-rex': {
    code: 'mecha-rex',
    suitColor: 0xd97706, // Amber gold
    accentColor: 0xfbbf24, // Bright gold
    skinColor: 0x94a3b8, // Titanium silver
    hairColor: 0x475569,
    visorColor: 0xf59e0b,
  },
};

export class CharacterModel {
  public group: THREE.Group;
  private torso: THREE.Mesh;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private jetpackGroup: THREE.Group;
  private hoverboardGroup: THREE.Group;
  private jetpackFire: THREE.Mesh;

  constructor(characterCode: string = 'runner-dash') {
    const config = CHARACTER_THEMES[characterCode] || CHARACTER_THEMES['runner-dash'];
    this.group = new THREE.Group();

    // Suit Material
    const suitMat = new THREE.MeshStandardMaterial({
      color: config.suitColor,
      roughness: 0.35,
      metalness: 0.2,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: config.accentColor,
      emissive: config.accentColor,
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: config.skinColor,
      roughness: 0.5,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: config.hairColor,
      roughness: 0.4,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: config.visorColor || 0x38bdf8,
      emissive: config.visorColor || 0x38bdf8,
      emissiveIntensity: 0.6,
      roughness: 0.1,
    });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.65, 0.8, 0.4);
    this.torso = new THREE.Mesh(torsoGeo, suitMat);
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Jacket chest stripes
    const chestStripeGeo = new THREE.BoxGeometry(0.67, 0.2, 0.42);
    const chestStripe = new THREE.Mesh(chestStripeGeo, accentMat);
    this.torso.add(chestStripe);

    // 2. Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.65, 0);
    this.torso.add(this.headGroup);

    // Head base
    const headGeo = new THREE.BoxGeometry(0.48, 0.48, 0.48);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Hair / Cap
    const hairGeo = new THREE.BoxGeometry(0.52, 0.22, 0.52);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.2;
    this.headGroup.add(hair);

    // Futuristic visor / glasses
    const visorGeo = new THREE.BoxGeometry(0.46, 0.14, 0.18);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.22);
    this.headGroup.add(visor);

    // Headphones / Cyber ear pieces
    const earGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.58, 12);
    earGeo.rotateZ(Math.PI / 2);
    const earMesh = new THREE.Mesh(earGeo, accentMat);
    earMesh.position.y = 0.05;
    this.headGroup.add(earMesh);

    // 3. Arms
    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.46, 0.32, 0);
    this.torso.add(this.leftArmGroup);

    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    const leftArm = new THREE.Mesh(armGeo, suitMat);
    leftArm.position.y = -0.3;
    leftArm.castShadow = true;
    this.leftArmGroup.add(leftArm);

    // Right Arm
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.46, 0.32, 0);
    this.torso.add(this.rightArmGroup);

    const rightArm = new THREE.Mesh(armGeo, suitMat);
    rightArm.position.y = -0.3;
    rightArm.castShadow = true;
    this.rightArmGroup.add(rightArm);

    // 4. Legs
    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.2, -0.4, 0);
    this.torso.add(this.leftLegGroup);

    const legGeo = new THREE.BoxGeometry(0.24, 0.75, 0.24);
    const leftLeg = new THREE.Mesh(legGeo, suitMat);
    leftLeg.position.y = -0.35;
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);

    // Left Sneaker
    const shoeGeo = new THREE.BoxGeometry(0.26, 0.18, 0.42);
    const leftShoe = new THREE.Mesh(shoeGeo, accentMat);
    leftShoe.position.set(0, -0.7, 0.08);
    leftShoe.castShadow = true;
    this.leftLegGroup.add(leftShoe);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.2, -0.4, 0);
    this.torso.add(this.rightLegGroup);

    const rightLeg = new THREE.Mesh(legGeo, suitMat);
    rightLeg.position.y = -0.35;
    rightLeg.castShadow = true;
    this.rightLegGroup.add(rightLeg);

    // Right Sneaker
    const rightShoe = new THREE.Mesh(shoeGeo, accentMat);
    rightShoe.position.set(0, -0.7, 0.08);
    rightShoe.castShadow = true;
    this.rightLegGroup.add(rightShoe);

    // 5. Jetpack Attachment
    this.jetpackGroup = new THREE.Group();
    this.jetpackGroup.position.set(0, 0, -0.28);
    this.torso.add(this.jetpackGroup);

    const jetpackBodyGeo = new THREE.BoxGeometry(0.44, 0.5, 0.2);
    const jetpackMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2,
    });
    const jetpackBody = new THREE.Mesh(jetpackBodyGeo, jetpackMat);
    this.jetpackGroup.add(jetpackBody);

    // Thruster nozzles
    const thrusterGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 12);
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

    const leftThruster = new THREE.Mesh(thrusterGeo, nozzleMat);
    leftThruster.position.set(-0.14, -0.28, 0);
    this.jetpackGroup.add(leftThruster);

    const rightThruster = new THREE.Mesh(thrusterGeo, nozzleMat);
    rightThruster.position.set(0.14, -0.28, 0);
    this.jetpackGroup.add(rightThruster);

    // Flame mesh
    const fireGeo = new THREE.ConeGeometry(0.14, 0.55, 12);
    fireGeo.rotateX(Math.PI);
    const fireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    this.jetpackFire = new THREE.Mesh(fireGeo, fireMat);
    this.jetpackFire.position.set(0, -0.65, 0);
    this.jetpackGroup.add(this.jetpackFire);
    this.jetpackGroup.visible = false;

    // 6. Hoverboard Attachment
    this.hoverboardGroup = new THREE.Group();
    this.hoverboardGroup.position.set(0, 0.12, 0);
    this.group.add(this.hoverboardGroup);

    const boardDeckGeo = new THREE.BoxGeometry(0.7, 0.08, 1.6);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.5,
    });
    const boardDeck = new THREE.Mesh(boardDeckGeo, boardMat);
    boardDeck.castShadow = true;
    this.hoverboardGroup.add(boardDeck);

    // Glowing rim
    const rimGeo = new THREE.BoxGeometry(0.74, 0.04, 1.64);
    const rimMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    this.hoverboardGroup.add(rim);

    this.hoverboardGroup.visible = false;
  }

  public updateAnimation(
    time: number,
    status: {
      isRunning: boolean;
      isJumping: boolean;
      isSliding: boolean;
      hasJetpack: boolean;
      hasHoverboard: boolean;
      speedRatio: number; // 1.0 to 2.0
    }
  ) {
    const { isRunning, isJumping, isSliding, hasJetpack, hasHoverboard, speedRatio } = status;

    // Toggle accessories
    this.jetpackGroup.visible = hasJetpack;
    this.hoverboardGroup.visible = hasHoverboard && !hasJetpack;

    if (hasJetpack) {
      // Jetpack flight animation
      const flicker = 0.8 + Math.sin(time * 30) * 0.2;
      this.jetpackFire.scale.set(flicker, flicker, flicker);

      this.torso.position.y = 1.15;
      this.torso.rotation.x = 0.25; // Lean forward
      this.torso.rotation.z = Math.sin(time * 4) * 0.05;

      this.leftArmGroup.rotation.x = -0.5;
      this.rightArmGroup.rotation.x = -0.5;
      this.leftLegGroup.rotation.x = 0.3;
      this.rightLegGroup.rotation.x = 0.3;
      return;
    }

    if (hasHoverboard) {
      // Surfing pose on hoverboard
      const hoverBob = Math.sin(time * 8) * 0.05;
      this.hoverboardGroup.position.y = 0.15 + hoverBob;
      this.hoverboardGroup.rotation.y = Math.PI * 0.12;

      this.torso.position.y = 1.25 + hoverBob;
      this.torso.rotation.y = Math.PI * 0.18; // angled hips
      this.torso.rotation.x = 0.05;

      this.leftArmGroup.rotation.x = -0.6;
      this.rightArmGroup.rotation.x = 0.6;
      this.leftLegGroup.rotation.x = 0.15;
      this.rightLegGroup.rotation.x = -0.15;
      return;
    }

    if (isSliding) {
      // Slide under duck pose
      this.torso.position.y = 0.45;
      this.torso.rotation.x = -0.7; // lean back
      this.torso.rotation.y = 0;

      this.leftArmGroup.rotation.x = -1.2;
      this.rightArmGroup.rotation.x = -1.2;
      this.leftLegGroup.rotation.x = 1.3; // legs stretched forward
      this.rightLegGroup.rotation.x = 1.3;
      return;
    }

    if (isJumping) {
      // Jump pose
      this.torso.position.y = 1.15;
      this.torso.rotation.x = 0.1;
      this.torso.rotation.y = 0;

      this.leftArmGroup.rotation.x = -2.0; // arms up
      this.rightArmGroup.rotation.x = -2.0;
      this.leftLegGroup.rotation.x = 0.6; // legs tucked
      this.rightLegGroup.rotation.x = 0.4;
      return;
    }

    if (isRunning) {
      // Natural running cycle
      const runFrequency = 14 * speedRatio;
      const legSwing = Math.sin(time * runFrequency);
      const armSwing = Math.cos(time * runFrequency);

      // Torso bob and lean
      this.torso.position.y = 1.15 + Math.abs(Math.sin(time * runFrequency)) * 0.08;
      this.torso.rotation.x = 0.18; // athletic forward lean
      this.torso.rotation.y = 0;
      this.torso.rotation.z = Math.sin(time * runFrequency * 0.5) * 0.04;

      // Arms swing
      this.leftArmGroup.rotation.x = armSwing * 0.8;
      this.rightArmGroup.rotation.x = -armSwing * 0.8;

      // Legs swing
      this.leftLegGroup.rotation.x = -legSwing * 0.9;
      this.rightLegGroup.rotation.x = legSwing * 0.9;
    } else {
      // Idle breathing
      const breathe = Math.sin(time * 3) * 0.03;
      this.torso.position.y = 1.15 + breathe;
      this.torso.rotation.set(0, 0, 0);
      this.leftArmGroup.rotation.set(0, 0, 0);
      this.rightArmGroup.rotation.set(0, 0, 0);
      this.leftLegGroup.rotation.set(0, 0, 0);
      this.rightLegGroup.rotation.set(0, 0, 0);
    }
  }
}

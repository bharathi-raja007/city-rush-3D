# City Rush 3D — Endless Runner Adventure Game

**City Rush 3D** is a full-stack, playable 3D endless runner game inspired by the gameplay of Subway Surfers, built with React, Three.js, Express, and PostgreSQL (Cloud SQL).

---

## Features

### 1. 3D Gameplay Mechanics
- **3 Dynamic Lanes**: Smooth lateral transitions with authentic athletic leaning physics.
- **Dynamic Obstacles**:
  - High Overhead Barriers: Must slide under or change lane.
  - Low Roadblock Hurdles: Jump over or change lane.
  - Concrete Hazards: Tall roadblocks requiring lane switches.
  - Moving Hover-Trains: Oncoming crimson transit cars that approach the player.
- **Collectibles & Power-Ups**:
  - **Gold Coins**: Placed along tracks and in jumping arcs over hurdles.
  - **Coin Magnet**: Pulls all nearby coins towards the runner.
  - **Jetpack**: Takes flight high above ground obstacles through coin trails for 12 seconds.
  - **2X Score Multiplier**: Doubles score accumulation.
  - **Hoverboard Shield**: Provides hit protection, breaking upon collision instead of ending the run.
- **Audio & Sound Synthesizer**: Built-in procedural Web Audio synthesizer providing realistic jump whooshes, slide swooshes, coin chimes, shield shatter, crash impacts, and upbeat arcade synth music.

### 2. Characters & Customization
- **Dash Walker**: Balanced agility runner with blue-cyan cyber apparel.
- **Cyber Jax**: Emerald neon cyborg with agility stabilizers.
- **Nova Blade**: Hot pink urban ninja with high acceleration.
- **Mecha Rex**: Titanium gold cybernetic juggernaut.

### 3. Backend & Database Persistence
- **PostgreSQL Database** with 11 tables managed by Drizzle ORM.
- **Anti-Cheat Validation**: Server-side speed, coin rate, and score bounds checking.
- **Coin Audit Trail**: Database transactions logging all coin earnings and purchases.
- **Global Leaderboard**: Real-time rank calculation with podium medals.
- **Daily & Weekly Missions**: Objective tracking with instant reward payouts.

---

## Controls

### Desktop
- **← / A** or **→ / D**: Change Lane
- **↑ / W**: Jump
- **↓ / S**: Slide
- **Space**: Activate Hoverboard
- **P / Esc**: Pause / Resume

### Mobile
- **Swipe Left / Right**: Switch Lane
- **Swipe Up**: Jump
- **Swipe Down**: Slide
- **Double Tap**: Activate Hoverboard

---

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

3. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

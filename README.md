# ASTROBIT - C Programming Platform

> **Architectural & Functional Implementation based on the Software Requirements Specification (SRS)**  
> Designed for college-level engineering students to master C programming through a sleek 2D deep-space RPG progression system.

---

## 🌟 Key Features & SRS Compliance

### 1. Visual Theme & Precision Layout (SRS §3.1)
- **Retro-Style Bitmap Fonts**: Integrated `'Press Start 2P'`, `'Silkscreen'`, and `'VT323'` typography with deep-space neon blues (`#00f0ff`), stark whites (`#ffffff`), and vibrant oranges (`#ff7700`).
- **8-Point Grid System**: Every layout dimension, margin, padding, and UI handle strictly follows an 8-point harmonic grid.
- **Golden Ratio ($\phi \approx 1.618$) Workspace Partitioning**: Default 38.2% : 61.8% pane distribution between the problem statement panel and the coding environment, with one-click Golden Ratio snap handles.
- **60fps Atmospheric Backgrounds**: Optimized HTML5 Canvas engine rendering multi-layer parallax starfields, twinkling stars, dynamic nebula clouds, cosmic dust, and shooting stars that adapt to the active sector.

### 2. 2D Level Progression & Space Map (SRS §3.2)
- **Planetary Sectors**: 6 syllabus-aligned sectors (Helios Core, Nebulae Aegis, Chronos Orbit, Asteroid Belt, Quantum Void, Black Hole Horizon).
- **Official 2D Pixel-Art Astronaut**: Sliced and optimized from the specified asset `Gemini_Generated_Image_sr46edsr46edsr46.png` across 8 states:
  - `astronaut_idle.png`: Cadet wave & flight log avatar.
  - `astronaut_walking.png`: Dynamic spline navigation across space paths.
  - `astronaut_floating.png`: Zero-G coding with cosmic spark effects.
  - `astronaut_cheering.png`: Victory leap on test cases passed & level up!
  - `astronaut_typing.png`: Live compilation and execution feedback.
  - `astronaut_sitting.png`: Engineering theory & lab reference study.
  - `astronaut_running.png`: High-speed time attack sprint.
  - `astronaut_hint.png`: Puzzled bug hunter during hint requests & syntax errors.
- **Spline-Based Physics Pathing**: Buttery-smooth cubic Bézier spline interpolation ($B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$) with physics easing between nodes — **no teleporting**.
- **Cosmic Fog Unlocking**: Future modules are covered by cosmic fog until required level and XP milestones are achieved.

### 3. Interactive Coding Cockpit & Workspace (SRS §3.3 & §3.4)
- **Draggable Split-Panes**: Smooth 60fps resizable handles with Golden Ratio snap controls.
- **Monaco Code Editor**: Configured for C17/GCC syntax highlighting, bracket matching, auto-indentation, and dark cosmic theme.
- **Action Bar**:
  - `HINT`: Tiered hints with XP point deduction warnings.
  - `RUN TEST`: Sample test case verification without penalty.
  - `SUBMIT`: Full automated test suite evaluation with glowing cosmic aura.
  - `RESET`: Return code to clean lab template.

### 4. Live Heads-Up Display (HUD) (SRS §3.5)
- Spacecraft cockpit dashboard header persistent across all views.
- Fluid easing XP progress bar showing XP needed for the next astronaut rank.
- Real-time counters: Cleared problems, Attempted problems, Active sector telemetry.
- Synthesized Web Audio API 8-bit sound effects (warp sound, victory fanfares, error buzzes, keyboard ticks, click blips) with mute toggle.

### 5. Curriculum Modules & Problems (SRS §5)
All 21 syllabus-aligned problems implemented with complete problem statements, constraints, sample I/O, hints, and automated test cases:
1. **Module 1: Basic Operations & Loops (Helios Core)**
   - `p1_1`: Sum and Average of N Numbers
   - `p1_2`: Fibonacci Sequence Generator
   - `p1_3`: Prime Number Verifier
   - `p1_4`: Armstrong Number Checker
   - `p1_5`: Perfect and Strong Number Analyzer
2. **Module 2: Conditional Statements (Nebulae Aegis)**
   - `p2_1`: Roots of a Quadratic Equation
   - `p2_2`: Switch Statement Arithmetic Calculator
3. **Module 3: Functions & Recursion (Chronos Orbit)**
   - `p3_1`: Factorial: Recursive and Non-Recursive
   - `p3_2`: Greatest Common Divisor (GCD)
4. **Module 4: Arrays & Matrices (Asteroid Belt & Grid)**
   - `p4_1`: Find Min and Max in an Array
   - `p4_2`: Ascending Order Sort
   - `p4_3`: Symmetric Matrix Check
   - `p4_4`: Matrix Addition and Multiplication
5. **Module 5: Strings & Pointers (Quantum Void)**
   - `p5_1`: Substring Insertion into a String
   - `p5_2`: Call by Value vs Call by Reference (Pointers)
   - `p5_3`: Palindrome String Checker
   - `p5_4`: Substring Index Search
   - `p5_5`: Line, Word, and Character Counter
   - `p5_6`: Pointer Array Summation
6. **Module 6: Structures & File Handling (Black Hole Horizon)**
   - `p6_1`: Student Marks Calculation via Structure
   - `p6_2`: File Data Processing and Analysis

### 6. Dual-Mode Code Evaluation Engine (SRS §4.2 & §6.2)
- **Client-Side AST C Evaluation Sandbox**: Runs inside the browser in <50ms with strict 2-second timeout enforcement, full stdio simulation (`scanf`, `printf`, `getchar`), matrix and pointer arithmetic support.
- **Node.js Express Backend** (`server/server.js`): Exposes `/api/compile`, `/api/health`, and `/api/admin/metrics`.

### 7. Professor & TA Admin Command Deck (SRS §2.1)
- Live student progress roster with level, roll number, and solved count.
- Dynamic test case manager to inject custom hidden test cases into any syllabus problem.
- Class accuracy analytics and compiler sandbox diagnostics.

---

## 🚀 Running the Platform

### Start Frontend Application:
```bash
cmd /c npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### Start Backend API Server (Optional):
```bash
cmd /c npm run server
```
Runs at **`http://localhost:3001/`**.

### Run Automated Curriculum Test Suite:
```bash
node test_all_curriculum.js
```
Validates that all 21 problems pass all visible and hidden test cases.

# Pong Game Architecture

## Overview

The Pong game is built using Babylon.js for 3D rendering, TypeScript for type-safe development, and Vite for build tooling. The architecture follows a modular design with clear separation of concerns between game logic, rendering, input handling, and audio management.

## System Architecture

```mermaid
graph TB
    A[main.ts] --> B[Game]
    B --> C[Arena]
    B --> D[UIManager]
    B --> E[InputManager]
    B --> F[AudioManager]
    B --> G[Paddle]
    B --> H[Ball]
    B --> I[WinCondition]
    
    G --> J[collision.ts]
    H --> J
    H --> K[Settings]
    G --> K
    C --> K
    D --> K
    I --> K
    
    L[Babylon.js Engine] --> B
    L --> C
    L --> G
    H --> L
    D --> L
```

## Class Diagram

```mermaid
classDiagram
    class Game {
        -audio: AudioManager
        -engine: Engine
        -scene: Scene
        -arena: Arena
        -leftPaddle: Paddle
        -rightPaddle: Paddle
        -ball: Ball
        -ui: UIManager
        -input: InputManager
        -paused: boolean
        -gameOver: boolean
        -playerScore: number
        -aiScore: number
        -canvas: HTMLCanvasElement
        +constructor()
        +start()
        -isMobileDevice(): boolean
        -setupCamera()
        -setupLights()
        -serveIfRequested()
        -handlePaddleCollisions()
        -handleScoring()
        -resetPoint(message: string)
        -updateAI(dt: number)
        -tick()
        -createCanvas(): HTMLCanvasElement
    }

    class AudioManager {
        -green_paddle: StaticSound
        -red_paddle: StaticSound
        -wall: StaticSound
        -player_score: StaticSound
        -ai_score: StaticSound
        -unlocked: boolean
        +unlock(): Promise
        +playGreenPaddle()
        +playRedPaddle()
        +playWall()
        +playPlayerScore()
        +playAIScore()
    }

    class UIManager {
        -scoreText: TextBlock
        -centerText: TextBlock
        +constructor()
        +setScore(player: number, ai: number)
        +setCenterMessage(msg: string)
        +clearCenterMessage()
    }

    class InputManager {
        +up: boolean
        +down: boolean
        -servePressed: boolean
        -canServe: boolean
        -activeTouches: Map
        +constructor()
        +consumeServePressed(): boolean
        +enableServing()
        +disableServing()
        -onKeyDown(e: KeyboardEvent)
        -onKeyUp(e: KeyboardEvent)
        -isTouchDevice(): boolean
        -initializeTouchControls()
        -createTouchZones()
        -onTouchStart(e: TouchEvent)
        -onTouchMove(e: TouchEvent)
        -onTouchEnd(e: TouchEvent)
    }

    class Arena {
        +bounds: Bounds
        +constructor(scene: Scene)
    }

    class Paddle {
        +mesh: Mesh
        +constructor(scene: Scene, x: number, color: Color3)
        +setZ(z: number)
        +z: number
        +x: number
        +clampWithin(bounds: Bounds)
        +updatePlayer(dt: number, up: boolean, down: boolean, bounds: Bounds)
        +updateAI(dt: number, targetZ: number, speed: number, bounds: Bounds)
    }

    class Ball {
        +mesh: Mesh
        +vx: number
        +vz: number
        +constructor(scene: Scene)
        +x: number
        +z: number
        +x(v: number)
        +z(v: number)
        +resetPosition()
        +serve()
        +update(dt: number, bounds: Bounds): boolean
        +speedUpAndDeflect(outgoingDirX: number, impactAngleRad: number)
    }

    class WinCondition {
        <<static>>
        +readonly Deuce: number
        +readonly Player: number
        +readonly AI: number
        +readonly Continue: number
        +check(playerScore: number, aiScore: number): WinCondition
    }

    Game --> AudioManager
    Game --> UIManager
    Game --> InputManager
    Game --> Arena
    Game --> Paddle
    Game --> Ball
    Game --> WinCondition
```

## Game Loop Sequence Diagram

```mermaid
sequenceDiagram
    participant Main
    participant Game
    participant Input
    participant Ball
    participant Paddles
    participant Audio
    participant UI
    participant Collision

    Main->>Game: start()
    loop Game Loop
        Game->>Input: consumeServePressed()
        alt Game Paused & Serve Requested
            Game->>Audio: unlock()
            Game->>Ball: serve()
            Game->>UI: clearCenterMessage()
        end
        
        alt Game Not Paused
            Game->>Paddles: updatePlayer()
            Game->>Paddles: updateAI()
            Game->>Ball: update()
            Ball-->>Game: wallBounce?
            
            alt Wall Bounce
                Game->>Audio: playWall()
            end
            
            Game->>Collision: circleRectCollideXZ()
            alt Paddle Collision
                Game->>Ball: speedUpAndDeflect()
                Game->>Audio: playPaddle()
            end
            
            Game->>WinCondition: check()
            alt Point Scored
                Game->>Audio: playScore()
                Game->>UI: setScore()
                Game->>Ball: resetPosition()
                Game->>Paddles: setZ(0)
                Game->>UI: setCenterMessage()
            end
        end
        
        Game->>Game: scene.render()
    end
```

## Input Handling Flow

```mermaid
flowchart TD
    A[User Input] --> B{Input Type?}
    B -->|Keyboard| C[Key Events]
    B -->|Touch| D[Touch Events]
    
    C --> E[onKeyDown/onKeyUp]
    E --> F[Update up/down flags]
    E --> G[Set servePressed]
    
    D --> H[onTouchStart/Move/End]
    H --> I[Element Detection]
    I --> J{Zone Type?}
    J -->|Up Zone| K[Set up=true]
    J -->|Down Zone| L[Set down=true]
    J -->|Serve Zone| M[Set servePressed=true]
    
    F --> N[Game Loop Input Check]
    G --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Update Game State]
```

## Collision Detection System

```mermaid
flowchart LR
    A[Ball Position] --> B[Circle-Rect Collision]
    C[Paddle Position] --> B
    D[Paddle Dimensions] --> B
    
    B --> E{Collision Detected?}
    E -->|Yes| F[Calculate Impact Point]
    F --> G[Calculate Bounce Angle]
    G --> H[Apply Speed Increase]
    H --> I[Update Ball Velocity]
    I --> J[Play Sound Effect]
    
    E -->|No| K[Continue Movement]
```

## Module Dependencies

```mermaid
graph LR
    A[main.ts] --> B[Game]
    B --> C[Arena]
    B --> D[Audio]
    B --> E[UI]
    B --> F[Input]
    B --> G[Paddle]
    B --> H[Ball]
    B --> I[WinCondition]
    
    G --> J[collision]
    H --> J
    G --> K[Settings]
    H --> K
    C --> K
    E --> K
    I --> K
    F --> K
    D --> L[Babylon.js Audio]
    E --> L
    C --> L
    H --> L
    G --> L
    B --> L
    
    J --> M[types]
    K --> M
```

## Data Flow

```mermaid
flowchart TD
    A[Input Events] --> B[InputManager]
    B --> C[Game Loop]
    C --> D[Physics Update]
    D --> E[Collision Detection]
    E --> F[Audio Feedback]
    E --> G[Score Update]
    G --> H[UI Update]
    
    C --> I[Render Loop]
    I --> J[Babylon.js Scene]
    J --> K[Display Output]
```

## Key Design Patterns

### 1. **Singleton Pattern**
- `Game` class manages the entire game state
- `Settings` provides global configuration

### 2. **Observer Pattern**
- Babylon.js scene uses observables for render loop
- Input events are handled through event listeners

### 3. **Factory Pattern**
- Mesh creation through Babylon.js `MeshBuilder`
- Material creation for visual elements

### 4. **Strategy Pattern**
- Different input strategies (keyboard vs touch)
- AI behavior vs player control

## Configuration Management

The `Settings` module provides centralized configuration:

```mermaid
graph TB
    A[SETTINGS] --> B[World Config]
    A --> C[Paddle Config]
    A --> D[Ball Config]
    A --> E[AI Config]
    A --> F[Game Config]
    
    B --> G[Dimensions]
    B --> H[Table Thickness]
    
    C --> I[Size]
    C --> J[Speed]
    
    D --> K[Radius]
    D --> L[Speed]
    D --> M[Physics]
    
    E --> N[Speed]
    E --> O[Behavior]
    
    F --> P[Scoring]
    F --> Q[Win Conditions]
```

## Performance Considerations

1. **Render Loop Optimization**: Single render loop with efficient state updates
2. **Collision Detection**: Optimized circle-rectangle collision algorithm
3. **Audio Management**: Lazy loading and proper unlocking for browser compliance
4. **Memory Management**: Proper cleanup and object reuse

## Extensibility

The architecture supports easy extension:

- **New Game Modes**: Extend `WinCondition` class
- **Additional Input**: Implement new input handlers in `InputManager`
- **Visual Themes**: Modify material creation in `Arena` and `Paddle`
- **AI Behaviors**: Enhance `updateAI` method in `Paddle` class

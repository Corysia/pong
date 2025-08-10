import { AudioManager } from "./Audio";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Color3, Vector3 } from "@babylonjs/core/Maths/math";

import { Arena } from "./Arena";
import { Paddle } from "./Paddle";
import { Ball } from "./Ball";
import { UIManager } from "./UI";
import { InputManager } from "./Input";
import { circleRectCollideXZ } from "./collision";
import { SETTINGS, clamp, radians } from "./Settings";

/**
 * Manages the core logic and rendering of the Pong game using BabylonJS.
 * Handles initialization of the engine, scene, camera, lighting, arena, paddles, ball, UI, and input.
 * Controls the main game loop, including serving, paddle movement, AI behavior, collision detection, scoring, and rendering.
 *
 * @remarks
 * - The game starts in a paused state, waiting for the player to serve.
 * - The left paddle is controlled by the player, while the right paddle is controlled by AI.
 * - The UI displays scores and messages.
 * - Handles window resizing and updates the engine accordingly.
 *
 * @param canvas - The HTML canvas element used for rendering the game.
 *
 * @example
 * ```typescript
 * const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
 * const game = new Game(canvas);
 * game.start();
 * ```
 */
export class Game {
    private readonly audio: AudioManager;
    private readonly engine: Engine;
    private readonly scene: Scene;

    private readonly arena: Arena;
    private readonly leftPaddle: Paddle;
    private readonly rightPaddle: Paddle;
    private readonly ball: Ball;

    private readonly ui: UIManager;
    private readonly input: InputManager;

    private paused = true;
    private playerScore = 0;
    private aiScore = 0;

    private readonly canvas: HTMLCanvasElement;

    /**
     * Initializes the game instance with the provided HTML canvas element.
     * Sets up the BabylonJS engine, scene, camera, lights, input manager, UI manager, arena, paddles, and ball.
     * Also configures the render loop and window resize handling.
     *
     * @param canvas - The HTMLCanvasElement to render the game on.
     */
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: false });
        this.scene = new Scene(this.engine);
        this.audio = new AudioManager();

        this.setupCamera();
        this.setupLights();

        this.input = new InputManager();
        this.ui = new UIManager();
        this.ui.setScore(this.playerScore, this.aiScore);
        this.ui.setCenterMessage("Press Space to serve\n\n\nW - Up\nS - Down");

        this.arena = new Arena(this.scene);

        // Paddles at edges
        const px = this.arena.bounds.left + SETTINGS.wallPadding;
        const ax = this.arena.bounds.right - SETTINGS.wallPadding;
        this.leftPaddle = new Paddle(this.scene, px, Color3.Green());
        this.rightPaddle = new Paddle(this.scene, ax, Color3.Red());

        // Ball
        this.ball = new Ball(this.scene);

        // Loop
        this.scene.onBeforeRenderObservable.add(this.tick);

        window.addEventListener("resize", () => this.engine.resize());
    }

    /**
     * Initializes and configures the ArcRotateCamera for the game scene.
     *
     * - Sets camera position, rotation, and target.
     * - Restricts camera beta and radius limits to control zoom and angle.
     * - Adjusts wheel and panning sensitivity for user input.
     * - Attaches camera controls to the provided canvas.
     *
     * @private
     */
    private setupCamera() {
        const camera = new ArcRotateCamera(
            "cam",
            Math.PI * 1.5,
            0.95,
            65,
            new Vector3(0, 0.5, 0),
            this.scene
        );
        camera.lowerBetaLimit = 0.2;
        camera.upperBetaLimit = Math.PI / 2.05;
        camera.lowerRadiusLimit = 20;
        camera.upperRadiusLimit = 120;
        camera.wheelPrecision = 30;
        camera.panningSensibility = 120;
        camera.attachControl(this.canvas, true);
    }

    /**
     * Sets up the lighting for the scene by adding a hemispheric light and a directional light.
     *
     * - The hemispheric light simulates ambient lighting from above with a specified intensity.
     * - The directional light simulates sunlight or a focused light source with a lower intensity.
     *
     * @private
     */
    private setupLights() {
        const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
        hemi.intensity = 0.9;
        const dir = new DirectionalLight("dir", new Vector3(-0.4, -1, -0.3), this.scene);
        dir.intensity = 0.3;
    }


    /**
     * Checks if the user has pressed the serve key (space by default) while the game is paused.
     * If so, serves the ball, unpauses the game, and clears the center message.
     * This also unlocks the audio manager, allowing sounds to play.
     *
     * @private
     */
    private serveIfRequested() {
        if (this.paused && this.input.consumeServePressed()) {
            this.audio.unlock();   // <— unlock on first user gesture
            this.ball.serve();
            this.paused = false;
            this.ui.clearCenterMessage();
        }
    }


    /**
     * Checks for collisions between the ball and both paddles.
     * If a collision is detected, adjusts the ball's velocity to bounce it off the paddle.
     * Plays a sound effect when a paddle is hit.
     *
     * @private
     */
    private handlePaddleCollisions() {
        const r = SETTINGS.ball.radius;

        // Left paddle
        if (this.ball.vx < 0 && circleRectCollideXZ(
            this.ball.x, this.ball.z, r,
            this.leftPaddle.x, this.leftPaddle.z,
            SETTINGS.paddle.widthX, SETTINGS.paddle.lengthZ
        )) {
            const halfLen = SETTINGS.paddle.lengthZ / 2;
            const impact = (this.ball.z - this.leftPaddle.z) / halfLen;
            const angle = clamp(impact, -1, 1) * radians(SETTINGS.ball.bounceAngleMaxDeg);
            this.ball.x = this.leftPaddle.x + (SETTINGS.paddle.widthX / 2 + r + 0.01);
            this.ball.speedUpAndDeflect(+1, angle);
            this.audio.playGreenPaddle();     // <— play on paddle hit
        }

        // Right paddle
        if (this.ball.vx > 0 && circleRectCollideXZ(
            this.ball.x, this.ball.z, r,
            this.rightPaddle.x, this.rightPaddle.z,
            SETTINGS.paddle.widthX, SETTINGS.paddle.lengthZ
        )) {
            const halfLen = SETTINGS.paddle.lengthZ / 2;
            const impact = (this.ball.z - this.rightPaddle.z) / halfLen;
            const angle = clamp(impact, -1, 1) * radians(SETTINGS.ball.bounceAngleMaxDeg);
            this.ball.x = this.rightPaddle.x - (SETTINGS.paddle.widthX / 2 + r + 0.01);
            this.ball.speedUpAndDeflect(-1, angle);
            this.audio.playRedPaddle();     // <— play on paddle hit
        }
    }

    /**
     * Checks if the ball has crossed either side of the court.
     * If so, increments the corresponding score and resets the game to a serving state.
     * Plays a sound effect when a point is scored.
     *
     * @private
     */
    private handleScoring() {
        const r = SETTINGS.ball.radius;
        const b = this.arena.bounds;

        if (this.ball.x - r > b.right) {
            this.playerScore++;
            this.resetPoint("Point! Press Space to serve");
            this.audio.playPlayerScore();     // <— play on point scored
        } else if (this.ball.x + r < b.left) {
            this.aiScore++;
            this.resetPoint("Point! Press Space to serve");
            this.audio.playAIScore();     // <— play on point scored
        }
    }

    /**
     * Resets the game state after a point is scored.
     * Pauses the game, resets the ball and paddles to their initial positions,
     * updates the score display, and shows a center message.
     *
     * @param message - The message to display in the center of the UI.
     */
    private resetPoint(message: string) {
        this.paused = true;
        this.ball.resetPosition();
        this.leftPaddle.setZ(0);
        this.rightPaddle.setZ(0);
        this.ui.setScore(this.playerScore, this.aiScore);
        this.ui.setCenterMessage(message);
    }

    /**
     * Updates the AI-controlled paddle's position based on the ball's movement and AI settings.
     *
     * The AI will track the ball only when it is incoming (moving towards the right).
     * If tracking is disabled (ball not incoming), the paddle returns to the center at a specified speed.
     * Otherwise, the paddle moves towards the ball's z position at the maximum AI speed.
     *
     * @param dt - The delta time since the last update, used for smooth movement.
     */
    private updateAI(dt: number) {
        // AI tracks only when ball incoming (towards right)
        const incoming = this.ball.vx > 0;
        const targetZ = (SETTINGS.ai.trackOnlyWhenIncoming && !incoming) ? 0 : this.ball.z;
        const speed = (SETTINGS.ai.trackOnlyWhenIncoming && !incoming)
            ? SETTINGS.ai.returnToCenterSpeed
            : SETTINGS.ai.maxSpeed;

        this.rightPaddle.updateAI(dt, targetZ, speed, this.arena.bounds);
    }

    /**
     * Advances the game state by one tick, updating all entities and handling game logic.
     *
     * - Calculates the delta time since the last frame.
     * - Serves the ball if requested.
     * - If the game is not paused:
     *   - Updates the player's paddle position based on input and arena bounds.
     *   - Updates the AI paddle position.
     *   - Updates the ball's position and checks for boundary collisions.
     *   - Handles collisions between paddles and the ball.
     *   - Checks for scoring events and updates scores accordingly.
     *   - Plays wall bounce sound effect.
     */
    private readonly tick = () => {
        const dt = this.engine.getDeltaTime() / 1000;

        this.serveIfRequested();

        if (!this.paused) {
            // Player
            this.leftPaddle.updatePlayer(dt, this.input.up, this.input.down, this.arena.bounds);

            // AI
            this.updateAI(dt);

            // Ball
            this.ball.update(dt, this.arena.bounds);

            // Collisions
            this.handlePaddleCollisions();

            // Scoring
            this.handleScoring();
        }
        const wallBounce = this.ball.update(dt, this.arena.bounds);
        if (wallBounce) {
            this.audio.playWall();        // <— play on wall bounce
        }
    };

    /**
     * Starts the game loop by running the engine's render loop.
     * Continuously renders the current scene on each frame.
     */
    start() {
        this.engine.runRenderLoop(() => this.scene.render());
    }
}
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

        this.setupCamera();
        this.setupLights();

        this.input = new InputManager();
        this.ui = new UIManager();
        this.ui.setScore(this.playerScore, this.aiScore);
        this.ui.setCenterMessage("Press Space to serve");

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
     * Checks if the game is currently paused and if the serve action has been requested by the user.
     * If both conditions are met, serves the ball to start or resume gameplay, unpauses the game,
     * and clears any center message displayed on the UI.
     */
    private serveIfRequested() {
        if (this.paused && this.input.consumeServePressed()) {
            this.ball.serve();
            this.paused = false;
            this.ui.clearCenterMessage();
        }
    }

    /**
     * Checks for collisions between the ball and both paddles, and handles the ball's response.
     *
     * - If the ball is moving towards the left paddle and collides, calculates the impact position,
     *   determines the bounce angle, nudges the ball out of the paddle, and deflects its velocity.
     * - If the ball is moving towards the right paddle and collides, performs the same logic for the right paddle.
     *
     * The bounce angle is determined by where the ball hits the paddle, allowing for angled deflections.
     * The ball's position is adjusted to prevent it from getting stuck inside the paddle.
     *
     * Assumes existence of `circleRectCollideXZ`, `clamp`, and `radians` utility functions.
     */
    private handlePaddleCollisions() {
        const r = SETTINGS.ball.radius;

        // Left paddle if ball moving left
        if (this.ball.vx < 0 && circleRectCollideXZ(
            this.ball.x, this.ball.z, r,
            this.leftPaddle.x, this.leftPaddle.z,
            SETTINGS.paddle.widthX, SETTINGS.paddle.lengthZ
        )) {
            const halfLen = SETTINGS.paddle.lengthZ / 2;
            const impact = (this.ball.z - this.leftPaddle.z) / halfLen; // -1..1
            const angle = clamp(impact, -1, 1) * radians(SETTINGS.ball.bounceAngleMaxDeg);
            this.ball.x = this.leftPaddle.x + (SETTINGS.paddle.widthX / 2 + r + 0.01); // nudge out
            this.ball.speedUpAndDeflect(+1, angle);
        }

        // Right paddle if ball moving right
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
        }
    }

    /**
     * Checks if the ball has crossed the left or right boundaries of the arena,
     * indicating a score for either the player or the AI. Increments the appropriate
     * score and resets the point with a message prompting the user to serve.
     *
     * @private
     */
    private handleScoring() {
        const r = SETTINGS.ball.radius;
        const b = this.arena.bounds;

        if (this.ball.x - r > b.right) {
            this.playerScore++;
            this.resetPoint("Point! Press Space to serve");
        } else if (this.ball.x + r < b.left) {
            this.aiScore++;
            this.resetPoint("Point! Press Space to serve");
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
    };

    /**
     * Starts the game loop by running the engine's render loop.
     * Continuously renders the current scene on each frame.
     */
    start() {
        this.engine.runRenderLoop(() => this.scene.render());
    }
}
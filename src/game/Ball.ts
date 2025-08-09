import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math";
import type { Bounds } from "./types";
import { SETTINGS, radians } from "./Settings";

/**
 * Represents the ball in the Pong game.
 * Handles its mesh creation, position, velocity, serving, movement, and collision with the Z-axis walls.
 *
 * @remarks
 * The ball is rendered as a sphere mesh with custom material properties.
 * Its position and velocity are managed for gameplay, including serving and bouncing off walls.
 *
 * @property {Mesh} mesh - The BabylonJS mesh representing the ball.
 * @property {number} vx - The ball's velocity along the X-axis.
 * @property {number} vz - The ball's velocity along the Z-axis.
 *
 * @method constructor(scene: Scene) - Creates the ball mesh and initializes its position.
 * @method get x() - Gets the ball's X position.
 * @method get z() - Gets the ball's Z position.
 * @method set x(v: number) - Sets the ball's X position.
 * @method set z(v: number) - Sets the ball's Z position.
 * @method resetPosition() - Resets the ball to its starting position and zeroes its velocity.
 * @method serve() - Serves the ball with a randomized direction and angle.
 * @method update(dt: number, bounds: Bounds) - Updates the ball's position and handles wall collisions.
 * @method speedUpAndDeflect(outgoingDirX: number, impactAngleRad: number) - Increases the ball's speed and changes its direction after a paddle hit.
 */
export class Ball {
    readonly mesh: Mesh;
    vx = 0;
    vz = 0;

    /**
     * Creates a new ball mesh in the given Babylon.js scene, applies material properties,
     * and initializes its position.
     *
     * @param scene - The Babylon.js scene to which the ball mesh will be added.
     */
    constructor(scene: Scene) {
        const mat = new StandardMaterial("ballMat", scene);
        mat.diffuseColor = new Color3(1.0, 0.92, 0.2);
        mat.emissiveColor = new Color3(0.3, 0.25, 0.05);

        this.mesh = MeshBuilder.CreateSphere("ball", {
            diameter: SETTINGS.ball.radius * 2,
            segments: 18
        }, scene);
        this.mesh.material = mat;
        this.resetPosition();
    }

    get x() { return this.mesh.position.x; }
    get z() { return this.mesh.position.z; }
    set x(v: number) { this.mesh.position.x = v; }
    set z(v: number) { this.mesh.position.z = v; }

    /**
     * Resets the ball's position to the initial coordinates and stops its movement.
     *
     * Sets the mesh position to the center (x: 0, y: SETTINGS.ball.y, z: 0)
     * and resets both horizontal (`vx`) and vertical (`vz`) velocities to zero.
     */
    resetPosition() {
        this.mesh.position.set(0, SETTINGS.ball.y, 0);
        this.vx = 0;
        this.vz = 0;
    }

    /**
     * Serves the ball by resetting its position and assigning it a new velocity.
     * The direction along the X-axis is randomly chosen to be left or right.
     * The launch angle is randomized within a range determined by the maximum bounce angle setting.
     * The initial speed is set according to the game settings.
     */
    serve() {
        this.resetPosition();
        const dirX = Math.random() < 0.5 ? -1 : 1;
        const angle = (Math.random() * 2 - 1) * (SETTINGS.ball.bounceAngleMaxDeg * 0.6);
        const speed = SETTINGS.ball.speedStart;
        this.vx = Math.cos(radians(angle)) * speed * dirX;
        this.vz = Math.sin(radians(angle)) * speed;
    }

    /**
     * Updates the ball's position based on its velocity and the elapsed time.
     * Handles bouncing off the front and back Z-walls by reversing the Z velocity
     * and repositioning the ball to prevent it from passing through the wall.
     *
     * @param dt - The time delta since the last update, in seconds.
     * @param bounds - The boundaries of the play area, containing front and back Z limits.
     */
    update(dt: number, bounds: Bounds) {
        this.mesh.position.x += this.vx * dt;
        this.mesh.position.z += this.vz * dt;
        this.mesh.position.y = SETTINGS.ball.y;

        const r = SETTINGS.ball.radius;

        // Z-wall bounces
        if (this.mesh.position.z + r > bounds.front) {
            this.mesh.position.z = bounds.front - r;
            this.vz = -this.vz;
        } else if (this.mesh.position.z - r < bounds.back) {
            this.mesh.position.z = bounds.back + r;
            this.vz = -this.vz;
        }
    }

    /**
     * Increases the ball's speed and updates its velocity based on the direction and impact angle.
     *
     * The new speed is calculated by multiplying the current speed by a gain factor,
     * but is capped at a maximum value. The velocity components (`vx` and `vz`) are
     * then updated using the provided outgoing direction and impact angle.
     *
     * @param outgoingDirX - The horizontal direction multiplier for the outgoing ball (-1 or 1).
     * @param impactAngleRad - The angle of impact in radians, used to calculate the new velocity direction.
     */
    speedUpAndDeflect(outgoingDirX: number, impactAngleRad: number) {
        const speed = Math.min(Math.hypot(this.vx, this.vz) * SETTINGS.ball.speedGainPerHit, SETTINGS.ball.speedMax);
        this.vx = Math.cos(impactAngleRad) * speed * outgoingDirX;
        this.vz = Math.sin(impactAngleRad) * speed;
    }
}
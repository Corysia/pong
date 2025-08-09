import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math";
import type { Bounds } from "./types";
import { SETTINGS, clamp } from "./Settings";

/**
 * Represents a paddle in the Pong game.
 * Handles rendering, movement, and boundary clamping for both player and AI paddles.
 *
 * @remarks
 * The paddle is visualized as a box mesh with custom material properties.
 * It can be controlled by the player or AI, and its movement is restricted within specified bounds.
 *
 * @param scene - The Babylon.js scene to which the paddle mesh will be added.
 * @param x - The initial X position of the paddle.
 *
 * @property mesh - The Babylon.js mesh representing the paddle.
 * @property z - The current Z position of the paddle.
 * @property x - The current X position of the paddle.
 *
 * @method setZ - Sets the Z position of the paddle.
 * @method clampWithin - Restricts the paddle's Z position within the given bounds.
 * @method updatePlayer - Updates the paddle's position based on player input.
 * @method updateAI - Updates the paddle's position based on AI logic and target position.
 */
export class Paddle {
    readonly mesh: Mesh;

    constructor(scene: Scene, x: number) {
        const mat = new StandardMaterial("paddleMat", scene);
        mat.diffuseColor = new Color3(0.9, 0.9, 0.95);
        mat.emissiveColor = new Color3(0.2, 0.2, 0.25);

        this.mesh = MeshBuilder.CreateBox("paddle", {
            width: SETTINGS.paddle.widthX,
            depth: SETTINGS.paddle.lengthZ,
            height: SETTINGS.paddle.heightY
        }, scene);
        this.mesh.material = mat;

        this.mesh.position.set(x, SETTINGS.ball.y, 0);
    }

    /**
     * Sets the Z position of the paddle's mesh.
     * @param z - The new Z coordinate for the mesh position.
     */
    setZ(z: number) {
        this.mesh.position.z = z;
    }

    get z() { return this.mesh.position.z; }
    get x() { return this.mesh.position.x; }

    /**
     * Clamps the paddle's position along the Z-axis so that it remains within the specified bounds.
     * The paddle's position is adjusted to ensure it does not exceed the front or back boundaries,
     * taking into account half of the paddle's length.
     *
     * @param bounds - The boundaries within which the paddle should remain.
     */
    clampWithin(bounds: Bounds) {
        const half = SETTINGS.paddle.lengthZ / 2;
        this.mesh.position.z = clamp(this.mesh.position.z, bounds.back + half, bounds.front - half);
    }

    /**
     * Updates the player's paddle position based on input and clamps it within the specified bounds.
     *
     * @param dt - The delta time since the last update, used to scale movement.
     * @param up - Whether the "up" input is active, moving the paddle forward.
     * @param down - Whether the "down" input is active, moving the paddle backward.
     * @param bounds - The boundaries within which the paddle should be clamped.
     */
    updatePlayer(dt: number, up: boolean, down: boolean, bounds: Bounds) {
        if (up) this.mesh.position.z += SETTINGS.paddle.speed * dt;
        if (down) this.mesh.position.z -= SETTINGS.paddle.speed * dt;
        this.clampWithin(bounds);
    }

    /**
     * Updates the paddle's position using a simple AI to follow a target position along the Z axis.
     * The movement is clamped to a maximum speed and restricted within the provided bounds.
     *
     * @param dt - The time delta in seconds since the last update.
     * @param targetZ - The target Z position the paddle should move towards.
     * @param speed - The maximum speed at which the paddle can move.
     * @param bounds - The bounds within which the paddle's position should be clamped.
     */
    updateAI(dt: number, targetZ: number, speed: number, bounds: Bounds) {
        const dz = targetZ - this.mesh.position.z;
        const maxStep = speed * dt;
        const step = clamp(dz, -maxStep, maxStep);
        this.mesh.position.z += step;
        this.clampWithin(bounds);
    }
}
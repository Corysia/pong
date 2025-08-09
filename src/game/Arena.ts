import type { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4, Scalar } from "@babylonjs/core/Maths";
import type { Bounds } from "./types";
import { SETTINGS } from "./Settings";

/**
 * Represents the game arena, including its bounds, visual elements, and materials.
 * 
 * The `Arena` class is responsible for setting up the visual appearance of the game area,
 * including the table, center dashed line, and side walls. It also defines the bounds
 * of the playable area based on the provided settings.
 * 
 * @remarks
 * - Initializes the scene's background color.
 * - Creates and configures materials for the table, lines, and walls.
 * - Constructs the table mesh and applies shadows.
 * - Adds a dashed center line for visual separation.
 * - Adds visual side walls to indicate the Z-axis bounds.
 * 
 * @param scene - The Babylon.js scene to which the arena elements are added.
 * 
 * @property bounds - The calculated boundaries of the arena (left, right, back, front).
 */
export class Arena {
    readonly bounds: Bounds;

    constructor(scene: Scene) {
        scene.clearColor = new Color4(0.05, 0.06, 0.08, 1);

        this.bounds = {
            left: -SETTINGS.world.width / 2,
            right: SETTINGS.world.width / 2,
            back: -SETTINGS.world.depth / 2,
            front: SETTINGS.world.depth / 2
        };

        // Materials
        const tableMat = new StandardMaterial("tableMat", scene);
        tableMat.diffuseColor = new Color3(0.08, 0.17, 0.25);
        tableMat.specularColor = new Color3(0.02, 0.02, 0.02);
        tableMat.emissiveColor = new Color3(0.02, 0.05, 0.08);

        const lineMat = new StandardMaterial("lineMat", scene);
        lineMat.diffuseColor = new Color3(0.9, 0.9, 0.95);
        lineMat.emissiveColor = new Color3(0.6, 0.6, 0.7);

        const wallMat = new StandardMaterial("wallMat", scene);
        wallMat.diffuseColor = new Color3(0.15, 0.15, 0.18);
        wallMat.emissiveColor = new Color3(0.05, 0.05, 0.06);

        // Table
        const table = MeshBuilder.CreateBox("table", {
            width: SETTINGS.world.width + 2,
            depth: SETTINGS.world.depth + 2,
            height: SETTINGS.world.tableThickness
        }, scene);
        table.position.y = SETTINGS.world.tableThickness / 2 - 0.05;
        table.material = tableMat;
        table.receiveShadows = true;

        // Center dashed line
        const dashCount = 11;
        const dashLen = SETTINGS.world.depth / (dashCount * 1.5);
        const centerDashes = new TransformNode("centerDashes", scene);
        for (let i = 0; i < dashCount; i++) {
            const z = Scalar.Lerp(this.bounds.back + dashLen, this.bounds.front - dashLen, i / (dashCount - 1));
            const dash = MeshBuilder.CreateBox(`dash_${i}`, { width: 0.3, depth: dashLen, height: 0.1 }, scene);
            dash.material = lineMat;
            dash.position.set(0, SETTINGS.world.tableThickness + 0.01, z);
            dash.parent = centerDashes;
        }

        // Visual side walls (Z bounds)
        const wallThickness = 0.4;
        const wallLength = SETTINGS.world.width;
        const topWall = MeshBuilder.CreateBox("topWall", {
            width: wallLength,
            depth: wallThickness,
            height: 0.6
        }, scene);
        topWall.material = wallMat;
        topWall.position.set(0, SETTINGS.world.tableThickness + 0.3, this.bounds.front + wallThickness / 2);

        const bottomWall = topWall.clone("bottomWall")!;
        bottomWall.position.set(0, SETTINGS.world.tableThickness + 0.3, this.bounds.back - wallThickness / 2);
    }
}
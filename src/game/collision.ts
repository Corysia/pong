import { clamp } from "./Settings";

/**
 * Performs collision detection between a circle and a rectangle in the XZ plane.
 * Used for detecting ball-to-paddle collisions in the Pong game.
 *
 * @param cx - Circle center X coordinate.
 * @param cz - Circle center Z coordinate.
 * @param r - Circle radius.
 * @param rx - Rectangle center X coordinate.
 * @param rz - Rectangle center Z coordinate.
 * @param rw - Rectangle width along the X axis.
 * @param rd - Rectangle depth along the Z axis.
 * @returns True if the circle and rectangle collide, false otherwise.
 *
 * @example
 * ```ts
 * const hit = circleRectCollideXZ(
 *   ball.x, ball.z, ball.radius,
 *   paddle.x, paddle.z, paddleWidth, paddleDepth
 * );
 * ```
 */
export function circleRectCollideXZ(
    cx: number, cz: number, r: number,
    rx: number, rz: number, rw: number, rd: number
): boolean {
    const halfW = rw / 2;
    const halfD = rd / 2;
    const closestX = clamp(cx, rx - halfW, rx + halfW);
    const closestZ = clamp(cz, rz - halfD, rz + halfD);
    const dx = cx - closestX;
    const dz = cz - closestZ;
    return (dx * dx + dz * dz) <= r * r;
}
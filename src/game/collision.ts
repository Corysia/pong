import { clamp } from "./Settings";

// Circle (cx, cz, r) vs axis-aligned rect centered at (rx, rz) with width rw (X) and depth rd (Z)
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
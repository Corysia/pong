/**
 * Global game settings for Pong.
 *
 * @property world - Configuration for the game world dimensions.
 * @property world.width - Width of the game world.
 * @property world.depth - Depth of the game world.
 * @property world.tableThickness - Thickness of the table.
 *
 * @property paddle - Paddle configuration.
 * @property paddle.widthX - Paddle width along the X axis.
 * @property paddle.lengthZ - Paddle length along the Z axis.
 * @property paddle.heightY - Paddle height along the Y axis.
 * @property paddle.speed - Paddle movement speed.
 *
 * @property ball - Ball configuration.
 * @property ball.radius - Ball radius.
 * @property ball.speedStart - Initial ball speed.
 * @property ball.speedMax - Maximum ball speed.
 * @property ball.bounceAngleMaxDeg - Maximum bounce angle in degrees.
 * @property ball.speedGainPerHit - Speed multiplier applied on each hit.
 * @property ball.y - Ball height position (Y axis).
 *
 * @property ai - AI opponent configuration.
 * @property ai.maxSpeed - Maximum AI paddle speed.
 * @property ai.trackOnlyWhenIncoming - Whether AI tracks the ball only when it's incoming.
 * @property ai.returnToCenterSpeed - Speed at which AI returns paddle to center.
 *
 * @property wallPadding - Padding from the wall for gameplay elements.
 * @property uiFontSize - Font size for UI elements.
 */
export const SETTINGS = {
    world: {
        width: 50,
        depth: 30,
        tableThickness: 0.5
    },
    paddle: {
        widthX: 1.2,
        lengthZ: 8,
        heightY: 1.4,
        speed: 28
    },
    ball: {
        radius: 0.7,
        speedStart: 18,
        speedMax: 40,
        bounceAngleMaxDeg: 45,
        speedGainPerHit: 1.06,
        y: 0.8
    },
    ai: {
        maxSpeed: 20,
        trackOnlyWhenIncoming: true,
        returnToCenterSpeed: 10
    },
    game: {
        maxScore: 11,
        deuce: 10,
        skunk: 6
    },
    wallPadding: 2.0,
    uiFontSize: 32
} as const;

export const DEGREES_TO_RADIANS = Math.PI / 180;
export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
export const radians = (deg: number) => deg * DEGREES_TO_RADIANS;

export enum WinCondition {
    Player = 0,
    AI = 1,
    Continue = 2,
    Deuce = 3
}
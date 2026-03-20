import { Game } from "./game/Game";

/**
 * Entry point for the Pong game application.
 * Creates and starts a new game instance.
 *
 * @remarks
 * This file serves as the main application bootstrap.
 * It initializes the game and begins the game loop.
 */
const game = new Game();
game.start();
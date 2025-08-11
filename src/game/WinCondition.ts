import { SETTINGS } from "./Settings";

export class WinCondition {
    public static Deuce = 0;
    public static Player = 1;
    public static AI = 2;
    public static Continue = 3;

    /**
        * Determines the winner of the game based on the current scores.
        *
        * - Checks for deuce conditions where both players have reached the deuce score and determines the winner if a player leads by two points.
        * - Checks for a skunk condition where one player reaches the skunk score while the opponent has zero points.
        * - Checks for maximum score conditions where a player reaches the max score and leads by two points.
        *
        * @param playerScore - The current score of the player.
        * @param aiScore - The current score of the AI opponent.
        * @returns {WinCondition} - Returns the win condition for the player, the AI, or continues the game.
        */
    public static check(playerScore: number, aiScore: number): WinCondition {
        // Deuce
        if (playerScore == SETTINGS.game.deuce && aiScore == SETTINGS.game.deuce) {
            return WinCondition.Deuce;
        }

        // Deuce win condition
        if (playerScore >= SETTINGS.game.deuce && aiScore >= SETTINGS.game.deuce) {
            if (playerScore > aiScore + 1) {
                return WinCondition.Player;
            } else if (playerScore + 1 < aiScore) {
                return WinCondition.AI;
            }
        }

        // Skunk win conditions
        if (playerScore == SETTINGS.game.skunk && aiScore == 0) {
            return WinCondition.Player;
        } else if (aiScore == SETTINGS.game.skunk && playerScore == 0) {
            return WinCondition.AI;
        }

        // Max score
        if (playerScore == SETTINGS.game.maxScore && playerScore - aiScore > 1) {
            return WinCondition.Player;
        } else if (aiScore == SETTINGS.game.maxScore && aiScore - playerScore > 1) {
            return WinCondition.AI;
        }

        return WinCondition.Continue;
    }
}
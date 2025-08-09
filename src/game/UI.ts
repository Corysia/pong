import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import { SETTINGS } from "./Settings";

/**
 * Manages the game's UI elements using BabylonJS GUI.
 * Handles the display and updating of score and center messages.
 *
 * @remarks
 * - Creates a fullscreen advanced dynamic texture for UI rendering.
 * - Provides methods to update score and center messages.
 *
 * @example
 * ```ts
 * const uiManager = new UIManager();
 * uiManager.setScore(1, 2);
 * uiManager.setCenterMessage("Game Over");
 * uiManager.clearCenterMessage();
 * ```
 */
export class UIManager {
    private readonly scoreText: TextBlock;
    private readonly centerText: TextBlock;

    /**
     * Initializes the UI elements for the game, including the score and center text.
     * Creates a fullscreen advanced dynamic texture and adds two text blocks:
     * - `scoreText`: Displays the score at the top center of the screen.
     * - `centerText`: Displays centered text in the middle of the screen.
     *
     * The text blocks are styled according to the settings defined in `SETTINGS.uiFontSize`.
     */
    constructor() {
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.scoreText = new TextBlock();
        this.scoreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.scoreText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.scoreText.color = "#EEE";
        this.scoreText.fontSize = SETTINGS.uiFontSize;
        this.scoreText.top = "10px";
        ui.addControl(this.scoreText);

        this.centerText = new TextBlock();
        this.centerText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.centerText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.centerText.color = "#DDD";
        this.centerText.fontSize = SETTINGS.uiFontSize;
        ui.addControl(this.centerText);
    }

    /**
     * Updates the score display with the current player and AI scores.
     *
     * @param player - The current score of the player.
     * @param ai - The current score of the AI opponent.
     */
    setScore(player: number, ai: number) {
        this.scoreText.text = `You: ${player}    |    AI: ${ai}`;
    }

    /**
     * Sets the message displayed at the center of the UI.
     *
     * @param msg - The message to display in the center text element.
     */
    setCenterMessage(msg: string) {
        this.centerText.text = msg;
    }

    /**
     * Clears the center message by setting the center text to an empty string.
     *
     * @remarks
     * This method is typically used to remove any message currently displayed at the center of the UI.
     */
    clearCenterMessage() {
        this.centerText.text = "";
    }
}
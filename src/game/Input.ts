/**
 * Manages keyboard input for the game, tracking up/down movement and serve actions.
 *
 * Listens for key events on the window and updates state accordingly:
 * - Up movement: ArrowUp or W
 * - Down movement: ArrowDown or S
 * - Serve action: Space
 *
 * Use {@link consumeServePressed} to check and reset the serve action flag.
 */
export class InputManager {
    up = false;
    down = false;
    private servePressed = false;

    /**
     * Initializes the input event listeners for keydown and keyup events.
     * Attaches handlers to the window to capture keyboard input for the game.
     */
    constructor() {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    /**
     * Handles the keydown event for game input controls.
     * 
     * Sets the corresponding flags (`up`, `down`, `servePressed`) based on the pressed key:
     * - "ArrowUp" or "KeyW": sets `up` to true.
     * - "ArrowDown" or "KeyS": sets `down` to true.
     * - "Space": sets `servePressed` to true.
     *
     * @param e - The keyboard event triggered by a key press.
     */
    private readonly onKeyDown = (e: KeyboardEvent) => {
        if (e.code === "ArrowUp" || e.code === "KeyW") this.up = true;
        if (e.code === "ArrowDown" || e.code === "KeyS") this.down = true;
        if (e.code === "Space") this.servePressed = true;
    };

    /**
     * Handles the key up event for player input.
     * 
     * Sets the `up` or `down` flags to `false` when the corresponding keys are released.
     * Supports both arrow keys and WASD controls.
     * 
     * @param e - The keyboard event triggered when a key is released.
     */
    private readonly onKeyUp = (e: KeyboardEvent) => {
        if (e.code === "ArrowUp" || e.code === "KeyW") this.up = false;
        if (e.code === "ArrowDown" || e.code === "KeyS") this.down = false;
    };

    /**
     * Checks if the serve action has been triggered, resets the serve state, and returns the previous state.
     *
     * @returns {boolean} `true` if the serve was pressed since the last check; otherwise, `false`.
     */
    consumeServePressed(): boolean {
        const pressed = this.servePressed;
        this.servePressed = false;
        return pressed;
    }
}
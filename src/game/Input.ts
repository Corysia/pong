/**
 * Manages keyboard and touch input for the game, tracking up/down movement and serve actions.
 *
 * Listens for key events on the window and updates state accordingly:
 * - Up movement: ArrowUp or W
 * - Down movement: ArrowDown or S
 * - Serve action: Space
 * 
 * Touch controls:
 * - Up/Down movement: Touch zones on left/right sides of screen
 * - Serve action: Tap in center area
 *
 * Use {@link consumeServePressed} to check and reset the serve action flag.
 */
export class InputManager {
    up = false;
    down = false;
    private servePressed = false;
    private canServe = false;
    
    // Touch state tracking
    private readonly activeTouches = new Map<number, Touch>();

    /**
     * Initializes the input event listeners for keyboard and touch events.
     * Attaches handlers to capture keyboard and touch input for the game.
     */
    constructor() {
        globalThis.addEventListener("keydown", this.onKeyDown);
        globalThis.addEventListener("keyup", this.onKeyUp);
        
        // Initialize touch controls if on a touch device
        if (this.isTouchDevice()) {
            this.initializeTouchControls();
        }
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
        if (e.code === "Space" && this.canServe) this.servePressed = true;
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
     * Detects if the current device is a mobile/touch device.
     * Uses multiple checks to avoid false positives on desktop with touch support.
     * 
     * @returns {boolean} True if running on a mobile device, false otherwise.
     */
    private isTouchDevice(): boolean {
        // Check for touch support
        const hasTouch = 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;
        
        // Additional checks to avoid desktop with touch support
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = globalThis.innerWidth <= 768 || globalThis.screen?.width <= 768;
        
        return hasTouch && (isMobile || isSmallScreen);
    }

    /**
     * Initializes touch control zones and event listeners for mobile devices.
     * Creates visual touch controls and sets up touch event handlers.
     */
    private initializeTouchControls(): void {
        this.createTouchZones();
        globalThis.addEventListener("touchstart", this.onTouchStart, { passive: false });
        globalThis.addEventListener("touchmove", this.onTouchMove, { passive: false });
        globalThis.addEventListener("touchend", this.onTouchEnd, { passive: false });
        globalThis.addEventListener("touchcancel", this.onTouchEnd, { passive: false });
    }

    /**
     * Creates visual touch control zones for mobile devices.
     * Sets up HTML elements for up/down controls and serve button.
     */
    private createTouchZones(): void {
        // Create touch zones container
        const touchContainer = document.createElement("div");
        touchContainer.id = "touch-controls";
        touchContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
        `;

        // Up control zone (left side)
        const upZone = document.createElement("div");
        upZone.id = "touch-up";
        upZone.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            height: 50%;
            pointer-events: auto;
            background: radial-gradient(circle at center, rgba(0,255,0,0.1) 0%, transparent 70%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: rgba(255,255,255,0.3);
            user-select: none;
        `;
        upZone.innerHTML = "↑";

        // Down control zone (left side)
        const downZone = document.createElement("div");
        downZone.id = "touch-down";
        downZone.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 50%;
            height: 50%;
            pointer-events: auto;
            background: radial-gradient(circle at center, rgba(255,0,0,0.1) 0%, transparent 70%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            color: rgba(255,255,255,0.3);
            user-select: none;
        `;
        downZone.innerHTML = "↓";

        // Serve zone (right side)
        const serveZone = document.createElement("div");
        serveZone.id = "touch-serve";
        serveZone.style.cssText = `
            position: absolute;
            top: 0;
            right: 0;
            width: 50%;
            height: 100%;
            pointer-events: auto;
            background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: rgba(255,255,255,0.3);
            user-select: none;
        `;
        serveZone.innerHTML = "TAP TO<br>SERVE";

        touchContainer.appendChild(upZone);
        touchContainer.appendChild(downZone);
        touchContainer.appendChild(serveZone);
        document.body.appendChild(touchContainer);
    }

    /**
     * Handles touch start events for mobile controls.
     * Determines which control zone was touched and updates input state.
     */
    private readonly onTouchStart = (e: TouchEvent): void => {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            this.activeTouches.set(touch.identifier, touch);
            
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element?.id === "touch-up") {
                this.up = true;
            } else if (element?.id === "touch-down") {
                this.down = true;
            } else if (element?.id === "touch-serve") {
                if (this.canServe) this.servePressed = true;
            }
        }
    };

    /**
     * Handles touch move events for mobile controls.
     * Updates input state based on which control zones the touch moves over.
     */
    private readonly onTouchMove = (e: TouchEvent): void => {
        e.preventDefault();
        
        // Reset movement states
        this.up = false;
        this.down = false;
        
        for (const touch of e.changedTouches) {
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (element?.id === "touch-up") {
                this.up = true;
            } else if (element?.id === "touch-down") {
                this.down = true;
            }
        }
    };

    /**
     * Handles touch end events for mobile controls.
     * Clears input state when touches are released.
     */
    private readonly onTouchEnd = (e: TouchEvent): void => {
        e.preventDefault();
        
        for (const touch of e.changedTouches) {
            this.activeTouches.delete(touch.identifier);
        }
        
        // Reset movement states if no active touches
        if (this.activeTouches.size === 0) {
            this.up = false;
            this.down = false;
        }
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

    /**
     * Enables serving input.
     * Allows serve commands to be processed.
     */
    enableServing(): void {
        this.canServe = true;
    }

    /**
     * Disables serving input.
     * Prevents serve commands from being processed.
     */
    disableServing(): void {
        this.canServe = false;
    }
}
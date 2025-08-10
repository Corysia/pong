import { CreateAudioEngineAsync, CreateSoundAsync, StaticSound } from "@babylonjs/core";

export class AudioManager {
    private green_paddle?: StaticSound;
    private red_paddle?: StaticSound;
    private wall?: StaticSound;
    private player_score?: StaticSound;
    private ai_score?: StaticSound;
    private unlocked = false;

    /**
     * Unlocks the audio engine and loads all the necessary sound effects in the cache.
     * This must be called before any other method of the AudioManager class.
     * If the audio engine is already unlocked, this method does nothing.
     */
    async unlock() {
        if (!this.unlocked) {
            const audioEngine = await CreateAudioEngineAsync();
            this.green_paddle = await CreateSoundAsync("paddle", "./sfx/player-green.wav");
            this.red_paddle = await CreateSoundAsync("paddle", "./sfx/player-red.wav");
            this.wall = await CreateSoundAsync("wall", "./sfx/beat.wav");
            this.player_score = await CreateSoundAsync("you score", "./sfx/harmony.wav");
            this.ai_score = await CreateSoundAsync("ai score", "./sfx/failure.wav");
            await audioEngine.unlockAsync();
            this.unlocked = true;
        }
    }

    playGreenPaddle() { this.green_paddle?.play(); }
    playRedPaddle() { this.red_paddle?.play(); }
    playWall() { this.wall?.play(); }
    playPlayerScore() { this.player_score?.play(); }
    playAIScore() { this.ai_score?.play(); }
}
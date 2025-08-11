import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@babylonjs/core/Engines/engine', () => ({
    Engine: class MockEngine {
        constructor(canvas: HTMLCanvasElement, antialias?: boolean) { }
        dispose() { }
        getRenderWidth(): number { return 800; }
        getRenderHeight(): number { return 600; }
        runRenderLoop(_fn: () => void): void { }
        stopRenderLoop(): void { }
        getInputElement(): HTMLCanvasElement | undefined {
            return undefined;
        }
        onBeginFrameObservable = { add: () => { } };
        onEndFrameObservable = { add: () => { } };
        // Babylon sometimes tries to push these observables
    },
}));

vi.mock('@babylonjs/core/scene', () => ({
    Scene: class MockScene {
        activeCamera = null;
        lights: any[] = [];
        meshes: any[] = [];
        _evaluateActiveMeshes() { }
        _activeMeshes: any[] = [];
        dispose() { }
        render() { }
    },
}));


import { Game } from '../src/game/Game';
import { SETTINGS, WinCondition } from '../src/game/Settings';

describe('Game.CheckWinner', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game();
    });

    it('should return Deuce when both scores are equal to deuce', () => {
        const playerScore = SETTINGS.game.deuce;
        const aiScore = SETTINGS.game.deuce;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.Deuce);
    });

    it('should return Player when player score is greater than AI score by 2 in deuce condition', () => {
        const playerScore = SETTINGS.game.deuce + 2;
        const aiScore = SETTINGS.game.deuce;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.Player);
    });

    it('should return AI when AI score is greater than player score by 2 in deuce condition', () => {
        const playerScore = SETTINGS.game.deuce;
        const aiScore = SETTINGS.game.deuce + 2;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.AI);
    });

    it('should return Player when player score is equal to skunk and AI score is 0', () => {
        const playerScore = SETTINGS.game.skunk;
        const aiScore = 0;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.Player);
    });

    it('should return AI when AI score is equal to skunk and player score is 0', () => {
        const playerScore = 0;
        const aiScore = SETTINGS.game.skunk;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.AI);
    });

    it('should return Player when player score is equal to max score and leads by 2', () => {
        const playerScore = SETTINGS.game.maxScore;
        const aiScore = SETTINGS.game.maxScore - 2;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.Player);
    });

    it('should return AI when AI score is equal to max score and leads by 2', () => {
        const playerScore = SETTINGS.game.maxScore - 2;
        const aiScore = SETTINGS.game.maxScore;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.AI);
    });

    it('should return Continue when no win condition is met', () => {
        const playerScore = 5;
        const aiScore = 3;
        expect(game.CheckWinner(playerScore, aiScore)).toBe(WinCondition.Continue);
    });
});
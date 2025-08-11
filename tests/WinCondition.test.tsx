import { describe, it, expect } from 'vitest';
import { SETTINGS } from '../src/game/Settings';
import { WinCondition } from '../src/game/WinCondition';

describe('WinCondition.check', () => {

    it('should return Deuce when both scores are equal to deuce', () => {
        const playerScore = SETTINGS.game.deuce;
        const aiScore = SETTINGS.game.deuce;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.Deuce);
    });

    it('should return Player when player score is greater than AI score by 2 in deuce condition', () => {
        const playerScore = SETTINGS.game.deuce + 2;
        const aiScore = SETTINGS.game.deuce;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.Player);
    });

    it('should return AI when AI score is greater than player score by 2 in deuce condition', () => {
        const playerScore = SETTINGS.game.deuce;
        const aiScore = SETTINGS.game.deuce + 2;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.AI);
    });

    it('should return Player when player score is equal to skunk and AI score is 0', () => {
        const playerScore = SETTINGS.game.skunk;
        const aiScore = 0;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.Player);
    });

    it('should return AI when AI score is equal to skunk and player score is 0', () => {
        const playerScore = 0;
        const aiScore = SETTINGS.game.skunk;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.AI);
    });

    it('should return Player when player score is equal to max score and leads by 2', () => {
        const playerScore = SETTINGS.game.maxScore;
        const aiScore = SETTINGS.game.maxScore - 2;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.Player);
    });

    it('should return AI when AI score is equal to max score and leads by 2', () => {
        const playerScore = SETTINGS.game.maxScore - 2;
        const aiScore = SETTINGS.game.maxScore;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.AI);
    });

    it('should return Continue when no win condition is met', () => {
        const playerScore = 5;
        const aiScore = 3;
        expect(WinCondition.check(playerScore, aiScore)).toBe(WinCondition.Continue);
    });
});
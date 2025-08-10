import { Game } from './Game';
import { SETTINGS } from './Settings';
import { WinCondition } from './Settings';

describe('Game.CheckWinner', () => {
    let game: Game;

    beforeEach(() => {
        game = new Game(null); // Initialize game with null canvas
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
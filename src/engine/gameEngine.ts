import type { Board, Difficulty, GameMode, GameState, Player, PlayerInfo } from '../types/game';
import { PIECES_PER_PLAYER } from '../types/game';

export function createEmptyBoard(): Board {
  return Array(16).fill(null);
}

const DEFAULT_PLAYERS: Record<Player, PlayerInfo> = {
  black: { name: 'Negras', color: '#1a1a2e' },
  white: { name: 'Blancas', color: '#f0e6d3' },
};

export function createInitialState(
  mode: GameMode = 'vs',
  difficulty: Difficulty = 'easy',
  players?: Record<Player, PlayerInfo>,
  startingPlayer?: Player,
  score?: Record<Player, number>,
): GameState {
  const humanPlayer: Player = mode === 'solo' ? 'black' : (startingPlayer ?? 'black');
  return {
    board: createEmptyBoard(),
    currentPlayer: startingPlayer ?? 'black',
    phase: 'place',
    winner: null,
    winningCells: null,
    isDraw: false,
    piecesLeft: { black: PIECES_PER_PLAYER, white: PIECES_PER_PLAYER },
    extraRotations: 0,
    nextPieceId: 1,
    movedOpponentFrom: null,
    movedOpponentTo: null,
    mode,
    difficulty,
    humanPlayer,
    players: players ?? DEFAULT_PLAYERS,
    score: score ?? { black: 0, white: 0 },
  };
}

const OUTER_ORBIT = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4];
const INNER_ORBIT = [5, 6, 10, 9];

export function rotateBoard(board: Board): Board {
  const newBoard = [...board];

  const outerLast = board[OUTER_ORBIT[OUTER_ORBIT.length - 1]];
  for (let i = OUTER_ORBIT.length - 1; i > 0; i--) {
    newBoard[OUTER_ORBIT[i]] = board[OUTER_ORBIT[i - 1]];
  }
  newBoard[OUTER_ORBIT[0]] = outerLast;

  const innerLast = board[INNER_ORBIT[INNER_ORBIT.length - 1]];
  for (let i = INNER_ORBIT.length - 1; i > 0; i--) {
    newBoard[INNER_ORBIT[i]] = board[INNER_ORBIT[i - 1]];
  }
  newBoard[INNER_ORBIT[0]] = innerLast;

  return newBoard;
}

function toRowCol(index: number): [number, number] {
  return [Math.floor(index / 4), index % 4];
}

function cellPlayer(board: Board, index: number): Player | null {
  return board[index]?.player ?? null;
}

const ALL_LINES: number[][] = (() => {
  const lines: number[][] = [];
  for (let r = 0; r < 4; r++) lines.push([r * 4, r * 4 + 1, r * 4 + 2, r * 4 + 3]);
  for (let c = 0; c < 4; c++) lines.push([c, c + 4, c + 8, c + 12]);
  lines.push([0, 5, 10, 15]);
  lines.push([3, 6, 9, 12]);
  return lines;
})();

function findWinningLines(board: Board, player: Player): number[][] {
  return ALL_LINES.filter((line) => line.every((i) => cellPlayer(board, i) === player));
}

export interface WinResult {
  winner: Player | null;
  winningCells: number[] | null;
  isDraw: boolean;
}

export function checkWinner(board: Board): WinResult {
  const blackWins = findWinningLines(board, 'black');
  const whiteWins = findWinningLines(board, 'white');

  if (blackWins.length > 0 && whiteWins.length > 0) {
    const allCells = [...new Set([...blackWins.flat(), ...whiteWins.flat()])];
    return { winner: null, winningCells: allCells, isDraw: true };
  }
  if (blackWins.length > 0) return { winner: 'black', winningCells: blackWins.flat(), isDraw: false };
  if (whiteWins.length > 0) return { winner: 'white', winningCells: whiteWins.flat(), isDraw: false };
  return { winner: null, winningCells: null, isDraw: false };
}

export function getOpponent(player: Player): Player {
  return player === 'black' ? 'white' : 'black';
}

export function isValidOpponentMove(
  board: Board,
  from: number,
  to: number,
  currentPlayer: Player
): boolean {
  const opponent = getOpponent(currentPlayer);
  if (cellPlayer(board, from) !== opponent) return false;
  if (board[to] !== null) return false;

  const [r1, c1] = toRowCol(from);
  const [r2, c2] = toRowCol(to);
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

export function getAdjacentEmpty(board: Board, from: number): number[] {
  const [r, c] = toRowCol(from);
  const adjacent: number[] = [];
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4) {
      const idx = nr * 4 + nc;
      if (board[idx] === null) adjacent.push(idx);
    }
  }
  return adjacent;
}

export function canMoveAnyOpponentPiece(board: Board, currentPlayer: Player): boolean {
  const opponent = getOpponent(currentPlayer);
  for (let i = 0; i < 16; i++) {
    if (cellPlayer(board, i) === opponent && getAdjacentEmpty(board, i).length > 0) return true;
  }
  return false;
}

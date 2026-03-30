import type { Board, Difficulty, Player } from '../types/game';
import {
  canMoveAnyOpponentPiece,
  checkWinner,
  getAdjacentEmpty,
  getOpponent,
  rotateBoard,
} from './gameEngine';

export interface AIMove {
  opponentFrom: number | null;
  opponentTo: number | null;
  placeAt: number;
}

function getEmptyCells(board: Board): number[] {
  return board.reduce<number[]>((acc, cell, i) => (cell === null ? [...acc, i] : acc), []);
}

function getOpponentPieceMoves(board: Board, currentPlayer: Player): [number, number][] {
  const opponent = getOpponent(currentPlayer);
  const moves: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    if (board[i]?.player === opponent) {
      for (const to of getAdjacentEmpty(board, i)) {
        moves.push([i, to]);
      }
    }
  }
  return moves;
}

// Score a board from the perspective of `player`
function evaluateBoard(board: Board, player: Player): number {
  const opponent = getOpponent(player);
  const lines = [
    [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
    [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
    [0, 5, 10, 15], [3, 6, 9, 12],
  ];

  let score = 0;
  for (const line of lines) {
    let mine = 0, theirs = 0;
    for (const i of line) {
      if (board[i]?.player === player) mine++;
      else if (board[i]?.player === opponent) theirs++;
    }
    if (theirs === 0) {
      if (mine === 4) score += 10000;
      else if (mine === 3) score += 100;
      else if (mine === 2) score += 10;
    }
    if (mine === 0) {
      if (theirs === 4) score -= 10000;
      else if (theirs === 3) score -= 100;
      else if (theirs === 2) score -= 10;
    }
  }
  return score;
}

function simulatePlace(board: Board, index: number, player: Player, pieceId: string): Board {
  const b = [...board];
  b[index] = { id: pieceId, player };
  return b;
}

function simulateOpponentMove(board: Board, from: number, to: number): Board {
  const b = [...board];
  b[to] = b[from];
  b[from] = null;
  return b;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Easy: fully random valid moves
function aiEasy(board: Board, currentPlayer: Player): AIMove {
  const empty = getEmptyCells(board);
  const canMove = canMoveAnyOpponentPiece(board, currentPlayer);

  let opponentFrom: number | null = null;
  let opponentTo: number | null = null;

  if (canMove && Math.random() > 0.5) {
    const moves = getOpponentPieceMoves(board, currentPlayer);
    if (moves.length > 0) {
      [opponentFrom, opponentTo] = pickRandom(moves);
    }
  }

  let boardAfterMove = board;
  if (opponentFrom !== null && opponentTo !== null) {
    boardAfterMove = simulateOpponentMove(board, opponentFrom, opponentTo);
  }

  const emptyAfter = getEmptyCells(boardAfterMove);
  return { opponentFrom, opponentTo, placeAt: pickRandom(emptyAfter.length > 0 ? emptyAfter : empty) };
}

// Normal: random but prioritizes blocking 3-in-a-row and completing own 3
function aiNormal(board: Board, currentPlayer: Player): AIMove {
  const canMove = canMoveAnyOpponentPiece(board, currentPlayer);

  let opponentFrom: number | null = null;
  let opponentTo: number | null = null;

  if (canMove && Math.random() > 0.3) {
    const moves = getOpponentPieceMoves(board, currentPlayer);
    if (moves.length > 0) {
      [opponentFrom, opponentTo] = pickRandom(moves);
    }
  }

  let boardAfterMove = board;
  if (opponentFrom !== null && opponentTo !== null) {
    boardAfterMove = simulateOpponentMove(board, opponentFrom, opponentTo);
  }

  const empty = getEmptyCells(boardAfterMove);
  let bestPlace = pickRandom(empty);
  let bestScore = -Infinity;

  for (const idx of empty) {
    const placed = simulatePlace(boardAfterMove, idx, currentPlayer, '_tmp');
    const rotated = rotateBoard(placed);
    const score = evaluateBoard(rotated, currentPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestPlace = idx;
    }
  }

  return { opponentFrom, opponentTo, placeAt: bestPlace };
}

// Hard: evaluates all combinations of opponent move + placement
function aiHard(board: Board, currentPlayer: Player): AIMove {
  const opponentMoves: ([number, number] | null)[] = [null];
  if (canMoveAnyOpponentPiece(board, currentPlayer)) {
    opponentMoves.push(...getOpponentPieceMoves(board, currentPlayer));
  }

  let bestScore = -Infinity;
  let bestMove: AIMove = { opponentFrom: null, opponentTo: null, placeAt: getEmptyCells(board)[0] };

  for (const om of opponentMoves) {
    let boardAfterMove = board;
    if (om) {
      boardAfterMove = simulateOpponentMove(board, om[0], om[1]);
    }

    const empty = getEmptyCells(boardAfterMove);
    for (const placeIdx of empty) {
      const placed = simulatePlace(boardAfterMove, placeIdx, currentPlayer, '_tmp');
      const rotated = rotateBoard(placed);
      const score = evaluateBoard(rotated, currentPlayer);

      if (score > bestScore) {
        bestScore = score;
        bestMove = {
          opponentFrom: om ? om[0] : null,
          opponentTo: om ? om[1] : null,
          placeAt: placeIdx,
        };
      }
    }
  }

  return bestMove;
}

// Impossible: minimax with depth looking ahead multiple turns
function minimax(board: Board, player: Player, maximizing: Player, depth: number): number {
  const result = checkWinner(board);
  if (result.winner === maximizing) return 10000 + depth;
  if (result.winner === getOpponent(maximizing)) return -10000 - depth;
  if (result.isDraw) return 0;
  if (depth === 0) return evaluateBoard(board, maximizing);

  const empty = getEmptyCells(board);
  if (empty.length === 0) return evaluateBoard(board, maximizing);

  const isMax = player === maximizing;
  let best = isMax ? -Infinity : Infinity;

  // Sample a subset of placements to keep it tractable
  const placements = empty.length > 6 ? empty.slice(0, 6) : empty;

  for (const idx of placements) {
    const placed = simulatePlace(board, idx, player, '_mm');
    const rotated = rotateBoard(placed);
    const score = minimax(rotated, getOpponent(player), maximizing, depth - 1);
    best = isMax ? Math.max(best, score) : Math.min(best, score);
  }
  return best;
}

function aiImpossible(board: Board, currentPlayer: Player): AIMove {
  const opponentMoves: ([number, number] | null)[] = [null];
  if (canMoveAnyOpponentPiece(board, currentPlayer)) {
    opponentMoves.push(...getOpponentPieceMoves(board, currentPlayer));
  }

  let bestScore = -Infinity;
  let bestMove: AIMove = { opponentFrom: null, opponentTo: null, placeAt: getEmptyCells(board)[0] };

  for (const om of opponentMoves) {
    const boardAfterMove = om ? simulateOpponentMove(board, om[0], om[1]) : board;
    const empty = getEmptyCells(boardAfterMove);

    for (const placeIdx of empty) {
      const placed = simulatePlace(boardAfterMove, placeIdx, currentPlayer, '_tmp');
      const rotated = rotateBoard(placed);

      // Check immediate win
      const result = checkWinner(rotated);
      if (result.winner === currentPlayer) {
        return { opponentFrom: om?.[0] ?? null, opponentTo: om?.[1] ?? null, placeAt: placeIdx };
      }

      // Minimax from opponent's perspective, depth 2
      const score = minimax(rotated, getOpponent(currentPlayer), currentPlayer, 2);

      if (score > bestScore) {
        bestScore = score;
        bestMove = { opponentFrom: om?.[0] ?? null, opponentTo: om?.[1] ?? null, placeAt: placeIdx };
      }
    }
  }

  return bestMove;
}

export function getAIMove(board: Board, currentPlayer: Player, difficulty: Difficulty): AIMove {
  switch (difficulty) {
    case 'easy': return aiEasy(board, currentPlayer);
    case 'normal': return aiNormal(board, currentPlayer);
    case 'hard': return aiHard(board, currentPlayer);
    case 'impossible': return aiImpossible(board, currentPlayer);
  }
}

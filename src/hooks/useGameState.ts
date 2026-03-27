import { useCallback, useState } from 'react';
import type { GameState } from '../types/game';
import { MAX_EXTRA_ROTATIONS } from '../types/game';
import {
  canMoveAnyOpponentPiece,
  checkWinner,
  createInitialState,
  getAdjacentEmpty,
  getOpponent,
  isValidOpponentMove,
  rotateBoard,
} from '../engine/gameEngine';

function applyRotationResult(prev: GameState, rotated: import('../types/game').Board): GameState {
  const result = checkWinner(rotated);

  if (result.isDraw) {
    return { ...prev, board: rotated, phase: 'game-over', winner: null, winningCells: result.winningCells, isDraw: true };
  }
  if (result.winner) {
    return { ...prev, board: rotated, phase: 'game-over', winner: result.winner, winningCells: result.winningCells, isDraw: false };
  }

  // No winner — check if we're in rotate-only phase
  if (prev.phase === 'rotate-only') {
    const next = prev.extraRotations + 1;
    if (next >= MAX_EXTRA_ROTATIONS) {
      return { ...prev, board: rotated, phase: 'game-over', winner: null, winningCells: null, isDraw: true, extraRotations: next };
    }
    return { ...prev, board: rotated, extraRotations: next };
  }

  // Normal turn — advance to next player
  const nextPlayer = getOpponent(prev.currentPlayer);
  const bothOutOfPieces = prev.piecesLeft.black === 0 && prev.piecesLeft.white === 0;

  if (bothOutOfPieces) {
    return { ...prev, board: rotated, currentPlayer: nextPlayer, phase: 'rotate-only', movedOpponentFrom: null, movedOpponentTo: null };
  }

  const nextHasPieces = prev.piecesLeft[nextPlayer] > 0;
  const canMove = canMoveAnyOpponentPiece(rotated, nextPlayer);

  return {
    ...prev,
    board: rotated,
    currentPlayer: nextPlayer,
    phase: nextHasPieces ? (canMove ? 'move-opponent' : 'place') : 'rotate-only',
    movedOpponentFrom: null,
    movedOpponentTo: null,
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<number[]>([]);

  const reset = useCallback(() => {
    setState(createInitialState());
    setSelectedPiece(null);
    setValidMoves([]);
  }, []);

  const skipMovePhase = useCallback(() => {
    setState((s) => ({ ...s, phase: 'place' }));
    setSelectedPiece(null);
    setValidMoves([]);
  }, []);

  const handleCellClick = useCallback(
    (index: number) => {
      if (state.phase === 'game-over' || state.phase === 'rotate' || state.phase === 'rotate-only') return;

      if (state.phase === 'move-opponent') {
        const opponent = getOpponent(state.currentPlayer);

        if (state.board[index] === opponent) {
          const moves = getAdjacentEmpty(state.board, index);
          if (moves.length > 0) {
            setSelectedPiece(index);
            setValidMoves(moves);
          }
          return;
        }

        if (selectedPiece !== null && validMoves.includes(index)) {
          if (isValidOpponentMove(state.board, selectedPiece, index, state.currentPlayer)) {
            const newBoard = [...state.board];
            newBoard[index] = newBoard[selectedPiece];
            newBoard[selectedPiece] = null;
            setState((s) => ({
              ...s,
              board: newBoard,
              phase: 'place',
              movedOpponentFrom: selectedPiece,
              movedOpponentTo: index,
            }));
            setSelectedPiece(null);
            setValidMoves([]);
          }
          return;
        }

        setSelectedPiece(null);
        setValidMoves([]);
        return;
      }

      if (state.phase === 'place') {
        if (state.board[index] !== null) return;

        const newBoard = [...state.board];
        newBoard[index] = state.currentPlayer;
        setState((s) => ({
          ...s,
          board: newBoard,
          phase: 'rotate',
          piecesLeft: {
            ...s.piecesLeft,
            [s.currentPlayer]: s.piecesLeft[s.currentPlayer] - 1,
          },
        }));
      }
    },
    [state, selectedPiece, validMoves]
  );

  const handleRotate = useCallback(() => {
    if (state.phase !== 'rotate' && state.phase !== 'rotate-only') return;

    const rotated = rotateBoard(state.board);
    setState((s) => applyRotationResult(s, rotated));
  }, [state]);

  return {
    state,
    selectedPiece,
    validMoves,
    handleCellClick,
    handleRotate,
    skipMovePhase,
    reset,
  };
}

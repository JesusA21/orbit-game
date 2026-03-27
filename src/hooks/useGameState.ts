import { useCallback, useEffect, useState } from 'react';
import type { Board, Difficulty, GameMode, GameState } from '../types/game';
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
import { getAIMove } from '../engine/ai';

function applyRotationResult(prev: GameState, rotated: Board): GameState {
  const result = checkWinner(rotated);

  if (result.isDraw) {
    return { ...prev, board: rotated, phase: 'game-over', winner: null, winningCells: result.winningCells, isDraw: true };
  }
  if (result.winner) {
    return { ...prev, board: rotated, phase: 'game-over', winner: result.winner, winningCells: result.winningCells, isDraw: false };
  }

  if (prev.phase === 'rotate-only') {
    const next = prev.extraRotations + 1;
    if (next >= MAX_EXTRA_ROTATIONS) {
      return { ...prev, board: rotated, phase: 'game-over', winner: null, winningCells: null, isDraw: true, extraRotations: next };
    }
    return { ...prev, board: rotated, extraRotations: next };
  }

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
  const [state, setState] = useState<GameState | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<number[]>([]);

  const startGame = useCallback((mode: GameMode, difficulty: Difficulty) => {
    setState(createInitialState(mode, difficulty));
    setSelectedPiece(null);
    setValidMoves([]);
  }, []);

  const reset = useCallback(() => {
    if (!state) return;
    setState(createInitialState(state.mode, state.difficulty));
    setSelectedPiece(null);
    setValidMoves([]);
  }, [state]);

  const backToMenu = useCallback(() => {
    setState(null);
    setSelectedPiece(null);
    setValidMoves([]);
  }, []);

  const skipMovePhase = useCallback(() => {
    setState((s) => s ? { ...s, phase: 'place' } : s);
    setSelectedPiece(null);
    setValidMoves([]);
  }, []);

  const isCpuTurn = state !== null && state.mode === 'solo' && state.currentPlayer !== state.humanPlayer && state.phase !== 'game-over';

  // CPU auto-play
  useEffect(() => {
    if (!state || !isCpuTurn) return;

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let cancelled = false;

    (async () => {
      const aiMove = getAIMove(state.board, state.currentPlayer, state.difficulty);

      // Phase 1: move opponent piece (optional)
      if (aiMove.opponentFrom !== null && aiMove.opponentTo !== null && (state.phase === 'move-opponent')) {
        await delay(600);
        if (cancelled) return;
        const newBoard = [...state.board];
        newBoard[aiMove.opponentTo] = newBoard[aiMove.opponentFrom];
        newBoard[aiMove.opponentFrom] = null;
        setState((s) => s ? ({
          ...s,
          board: newBoard,
          phase: 'place',
          movedOpponentFrom: aiMove.opponentFrom,
          movedOpponentTo: aiMove.opponentTo,
        }) : s);
        await delay(500);
      } else if (state.phase === 'move-opponent') {
        await delay(400);
        if (cancelled) return;
        setState((s) => s ? ({ ...s, phase: 'place' }) : s);
        await delay(300);
      }

      if (cancelled) return;

      // Phase 2: place piece
      if (state.phase === 'move-opponent' || state.phase === 'place') {
        await delay(400);
        if (cancelled) return;
        setState((prev) => {
          if (!prev || prev.phase === 'game-over') return prev;
          const board = [...prev.board];
          const empty = board.reduce<number[]>((acc, c, i) => c === null ? [...acc, i] : acc, []);
          const target = empty.includes(aiMove.placeAt) ? aiMove.placeAt : empty[0];
          if (target === undefined) return prev;
          const pieceId = `${prev.currentPlayer[0]}${prev.nextPieceId}`;
          board[target] = { id: pieceId, player: prev.currentPlayer };
          return {
            ...prev,
            board,
            phase: 'rotate',
            nextPieceId: prev.nextPieceId + 1,
            piecesLeft: { ...prev.piecesLeft, [prev.currentPlayer]: prev.piecesLeft[prev.currentPlayer] - 1 },
          };
        });
        await delay(500);
      }

      if (cancelled) return;

      // Phase 3: rotate
      setState((prev) => {
        if (!prev || (prev.phase !== 'rotate' && prev.phase !== 'rotate-only')) return prev;
        const rotated = rotateBoard(prev.board);
        return applyRotationResult(prev, rotated);
      });
    })();

    return () => { cancelled = true; };
  }, [isCpuTurn, state?.phase, state?.currentPlayer]);

  const handleCellClick = useCallback(
    (index: number) => {
      if (!state || state.phase === 'game-over' || state.phase === 'rotate' || state.phase === 'rotate-only') return;
      if (isCpuTurn) return;

      if (state.phase === 'move-opponent') {
        const opponent = getOpponent(state.currentPlayer);

        if (state.board[index]?.player === opponent) {
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
            setState((s) => s ? ({
              ...s,
              board: newBoard,
              phase: 'place',
              movedOpponentFrom: selectedPiece,
              movedOpponentTo: index,
            }) : s);
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
        const pieceId = `${state.currentPlayer[0]}${state.nextPieceId}`;
        newBoard[index] = { id: pieceId, player: state.currentPlayer };
        setState((s) => s ? ({
          ...s,
          board: newBoard,
          phase: 'rotate',
          nextPieceId: s.nextPieceId + 1,
          piecesLeft: { ...s.piecesLeft, [s.currentPlayer]: s.piecesLeft[s.currentPlayer] - 1 },
        }) : s);
      }
    },
    [state, selectedPiece, validMoves, isCpuTurn]
  );

  const handleRotate = useCallback(() => {
    if (!state || (state.phase !== 'rotate' && state.phase !== 'rotate-only')) return;
    if (isCpuTurn) return;

    const rotated = rotateBoard(state.board);
    setState((s) => s ? applyRotationResult(s, rotated) : s);
  }, [state, isCpuTurn]);

  return {
    state,
    selectedPiece,
    validMoves,
    handleCellClick,
    handleRotate,
    skipMovePhase,
    reset,
    startGame,
    backToMenu,
    isCpuTurn,
  };
}

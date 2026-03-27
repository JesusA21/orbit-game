export type Player = 'black' | 'white';

export interface PieceData {
  id: string;
  player: Player;
}

export type Cell = PieceData | null;

// 4x4 board represented as a flat array of 16 cells
// Index mapping:
//  0  1  2  3
//  4  5  6  7
//  8  9 10 11
// 12 13 14 15
export type Board = Cell[];

export type Phase = 'move-opponent' | 'place' | 'rotate' | 'rotate-only' | 'game-over';

export const PIECES_PER_PLAYER = 8;
export const MAX_EXTRA_ROTATIONS = 10;

export interface GameState {
  board: Board;
  currentPlayer: Player;
  phase: Phase;
  winner: Player | null;
  winningCells: number[] | null;
  isDraw: boolean;
  piecesLeft: Record<Player, number>;
  extraRotations: number;
  nextPieceId: number;
  movedOpponentFrom: number | null;
  movedOpponentTo: number | null;
}

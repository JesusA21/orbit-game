export type Player = 'black' | 'white';

export interface PieceData {
  id: string;
  player: Player;
}

export type Cell = PieceData | null;

export type Board = Cell[];

export type Phase = 'move-opponent' | 'place' | 'rotate' | 'rotate-only' | 'game-over';
export type GameMode = 'vs' | 'solo';
export type Difficulty = 'easy' | 'normal' | 'hard';

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
  mode: GameMode;
  difficulty: Difficulty;
  humanPlayer: Player;
}

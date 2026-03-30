export type Player = 'black' | 'white';

export interface PlayerInfo {
  name: string;
  color: string;
  emoji?: string;
}

export const PIECE_EMOJIS = [
  '🪐', '👽', '🌑', '☀️', '🌙', '⭐', '🚀', '🛸',
  '☄️', '🌍', '🔭', '🌌', '👾', '🛰️', '💫', '🌕',
];

export interface PieceData {
  id: string;
  player: Player;
}

export type Cell = PieceData | null;

export type Board = Cell[];

export type Phase = 'move-opponent' | 'place' | 'rotate' | 'rotate-only' | 'game-over';
export type GameMode = 'vs' | 'solo';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'impossible';

export const PIECES_PER_PLAYER = 8;
export const MAX_EXTRA_ROTATIONS = 10;

export const PIECE_COLORS = [
  '#1a1a2e', '#f0e6d3', '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#a8a29e', '#0ea5e9',
];

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
  players: Record<Player, PlayerInfo>;
  score: Record<Player, number>;
}

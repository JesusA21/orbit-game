import { Cell } from './Cell';
import { OrbitButton } from './OrbitButton';
import type { GameState } from '../types/game';

interface BoardProps {
  state: GameState;
  selectedPiece: number | null;
  validMoves: number[];
  onCellClick: (index: number) => void;
  onRotate: () => void;
}

export function Board({ state, selectedPiece, validMoves, onCellClick, onRotate }: BoardProps) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        padding: 16,
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 20,
        width: 360,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {state.board.map((cell, i) => (
        <Cell
          key={i}
          value={cell}
          index={i}
          onClick={() => onCellClick(i)}
          isSelected={selectedPiece === i}
          isValidMove={validMoves.includes(i)}
          isWinning={state.winningCells?.includes(i) ?? false}
        />
      ))}
      <OrbitButton onClick={onRotate} disabled={state.phase !== 'rotate' && state.phase !== 'rotate-only'} />
    </div>
  );
}

import { motion } from 'framer-motion';
import type { Cell as CellType } from '../types/game';
import { Piece } from './Piece';

interface CellProps {
  value: CellType;
  index: number;
  onClick: () => void;
  isSelected: boolean;
  isValidMove: boolean;
  isWinning: boolean;
}

export function Cell({ value, onClick, isSelected, isValidMove, isWinning }: CellProps) {
  let bg = 'rgba(255,255,255,0.05)';
  if (isSelected) bg = 'rgba(59, 130, 246, 0.3)';
  else if (isValidMove) bg = 'rgba(34, 197, 94, 0.25)';

  return (
    <motion.div
      className="cell"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '100%',
        aspectRatio: '1',
        borderRadius: 12,
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        border: isValidMove ? '2px dashed rgba(34,197,94,0.5)' : '2px solid transparent',
        transition: 'background 0.2s',
      }}
    >
      {value && <Piece player={value} isWinning={isWinning} />}
    </motion.div>
  );
}

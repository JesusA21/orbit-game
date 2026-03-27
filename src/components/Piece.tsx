import { motion } from 'framer-motion';
import type { Player } from '../types/game';

interface PieceProps {
  player: Player;
  isWinning?: boolean;
}

export function Piece({ player, isWinning }: PieceProps) {
  const color = player === 'black' ? '#1a1a2e' : '#f0e6d3';
  const shadow = player === 'black' ? '#0d0d1a' : '#d4c9b8';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{
        scale: 1,
        boxShadow: isWinning
          ? '0 0 20px 6px rgba(255, 215, 0, 0.8)'
          : `0 4px 8px ${shadow}`,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        width: '70%',
        height: '70%',
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${
          player === 'black' ? '#2d2d4a' : '#fff8ef'
        }, ${color})`,
        border: `2px solid ${shadow}`,
      }}
    />
  );
}

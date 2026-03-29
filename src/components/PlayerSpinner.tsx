import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Player, PlayerInfo } from '../types/game';

interface SpinnerProps {
  players: Record<Player, PlayerInfo>;
  onDone: (starter: Player) => void;
}

export function PlayerSpinner({ players, onDone }: SpinnerProps) {
  const winner: Player = Math.random() < 0.5 ? 'black' : 'white';
  const [phase, setPhase] = useState<'spinning' | 'done'>('spinning');
  // Arrow ends pointing left (black) at 180deg or right (white) at 0deg
  const finalAngle = winner === 'black' ? 180 : 0;
  // Spin several full rotations + land on final angle
  const totalRotation = 360 * (4 + Math.floor(Math.random() * 3)) + finalAngle;

  useEffect(() => {
    const t = setTimeout(() => setPhase('done'), 2800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => onDone(winner), 1200);
      return () => clearTimeout(t);
    }
  }, [phase, onDone, winner]);

  const playerCard = (side: Player) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      opacity: phase === 'done' && winner !== side ? 0.3 : 1,
      transition: 'opacity 0.4s',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: players[side].color,
        border: '3px solid rgba(255,255,255,0.3)',
        boxShadow: phase === 'done' && winner === side ? `0 0 20px ${players[side].color}` : 'none',
      }} />
      <span style={{ fontSize: 16, fontWeight: 600 }}>{players[side].name}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>¿Quién inicia?</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        {playerCard('black')}

        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: totalRotation }}
          transition={{ duration: 2.6, ease: [0.2, 0.8, 0.3, 1] }}
          style={{ fontSize: 36 }}
        >
          ➤
        </motion.div>

        {playerCard('white')}
      </div>

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ fontSize: 18, fontWeight: 600 }}
        >
          ¡{players[winner].name} comienza! 🎯
        </motion.div>
      )}
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Difficulty, GameMode } from '../types/game';

interface ModeSelectProps {
  onStart: (mode: string, difficulty: string) => void;
  hasSavedGame: boolean;
  onContinue: () => void;
}

export function ModeSelect({ onStart, hasSavedGame, onContinue }: ModeSelectProps) {
  const [showDifficulty, setShowDifficulty] = useState(false);

  const btnStyle = {
    padding: '12px 32px',
    borderRadius: 12,
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600 as const,
  };

  const difficulties: { label: string; value: Difficulty; color: string }[] = [
    { label: '🟢 Fácil', value: 'easy', color: '#22c55e' },
    { label: '🟡 Normal', value: 'normal', color: '#f59e0b' },
    { label: '🔴 Difícil', value: 'hard', color: '#ef4444' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}
    >
      <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: 6 }}>🪐 ORBIT</h1>
      <p style={{ opacity: 0.6, fontSize: 14 }}>Selecciona un modo de juego</p>

      {!showDifficulty ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hasSavedGame && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              style={{ ...btnStyle, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
            >
              ▶️ Continuar partida
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStart('vs', 'easy')}
            style={{ ...btnStyle, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            👥 Vs Local
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDifficulty(true)}
            style={{ ...btnStyle, background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            🤖 Solitario
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <p style={{ textAlign: 'center', fontSize: 14, opacity: 0.7 }}>Elige dificultad</p>
          {difficulties.map((d) => (
            <motion.button
              key={d.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStart('solo', d.value)}
              style={{ ...btnStyle, background: d.color }}
            >
              {d.label}
            </motion.button>
          ))}
          <button
            onClick={() => setShowDifficulty(false)}
            style={{ ...btnStyle, background: 'rgba(255,255,255,0.1)', fontSize: 13 }}
          >
            ← Volver
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

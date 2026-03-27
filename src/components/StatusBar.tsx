import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../types/game';
import { MAX_EXTRA_ROTATIONS } from '../types/game';

interface StatusBarProps {
  state: GameState;
  onSkipMove: () => void;
  onReset: () => void;
}

const phaseLabels: Record<string, string> = {
  'move-opponent': 'Mueve una pieza rival (o salta)',
  place: 'Coloca tu pieza',
  rotate: 'Presiona el botón para rotar',
  'rotate-only': 'Solo rotación — presiona el botón central',
  'game-over': '¡Juego terminado!',
};

export function StatusBar({ state, onSkipMove, onReset }: StatusBarProps) {
  const playerName = state.currentPlayer === 'black' ? 'Negras' : 'Blancas';
  const playerColor = state.currentPlayer === 'black' ? '#1a1a2e' : '#f0e6d3';

  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <AnimatePresence mode="wait">
        {state.phase === 'game-over' ? (
          <motion.div
            key="winner"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ fontSize: 24, fontWeight: 700 }}
          >
            {state.isDraw
              ? '🤝 ¡Empate! 🤝'
              : `🏆 ¡Ganan las ${state.winner === 'black' ? 'Negras' : 'Blancas'}! 🏆`}
          </motion.div>
        ) : (
          <motion.div
            key={`${state.currentPlayer}-${state.phase}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: playerColor,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              />
              <span style={{ fontSize: 18, fontWeight: 600 }}>Turno: {playerName}</span>
            </div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>{phaseLabels[state.phase]}</div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>
              Piezas: ⚫ {state.piecesLeft.black} | ⚪ {state.piecesLeft.white}
              {state.phase === 'rotate-only' && ` | Rotaciones: ${state.extraRotations}/${MAX_EXTRA_ROTATIONS}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {state.phase === 'move-opponent' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onSkipMove}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Saltar movimiento
          </motion.button>
        )}
        {state.phase === 'game-over' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onReset}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Nueva partida
          </motion.button>
        )}
      </div>
    </div>
  );
}

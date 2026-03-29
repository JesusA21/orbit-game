import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../types/game';
import { MAX_EXTRA_ROTATIONS } from '../types/game';

interface StatusBarProps {
  state: GameState;
  isCpuTurn: boolean;
  onSkipMove: () => void;
  onReset: () => void;
  onBackToMenu: () => void;
}

const phaseLabels: Record<string, string> = {
  'move-opponent': 'Mueve una pieza rival (o salta)',
  place: 'Coloca tu pieza',
  rotate: 'Presiona el botón para rotar',
  'rotate-only': 'Solo rotación — presiona el botón central',
  'game-over': '¡Juego terminado!',
};

export function StatusBar({ state, isCpuTurn, onSkipMove, onReset, onBackToMenu }: StatusBarProps) {
  const isSolo = state.mode === 'solo';
  const isHuman = state.currentPlayer === state.humanPlayer;

  let turnLabel: string;
  if (isSolo) {
    turnLabel = isHuman ? 'Tu turno' : 'Turno de la CPU...';
  } else {
    turnLabel = `Turno: ${state.players[state.currentPlayer].name}`;
  }

  const playerColor = state.players[state.currentPlayer].color;

  let winnerText = '';
  if (state.phase === 'game-over') {
    if (state.isDraw) {
      winnerText = '🤝 ¡Empate! 🤝';
    } else if (isSolo) {
      winnerText = state.winner === state.humanPlayer ? '🏆 ¡Ganaste! 🏆' : '🤖 Ganó la CPU 🤖';
    } else {
      winnerText = `🏆 ¡Gana ${state.players[state.winner!].name}! 🏆`;
    }
  }

  const DARK_THRESHOLD = '#1a1a2e';
  const scoreColor = (color: string) => color === DARK_THRESHOLD ? '#6b7280' : color;

  const segmentFont = "'DSEG7-Classic', monospace";
  const glowStyle = (color: string) => {
    const c = scoreColor(color);
    return {
      fontFamily: segmentFont,
      fontSize: 36,
      fontWeight: 700 as const,
      color: c,
      textShadow: `0 0 8px ${c}, 0 0 20px ${c}88, 0 0 40px ${c}44`,
      lineHeight: 1,
    };
  };

  const blackName = isSolo && state.humanPlayer === 'black' ? 'Tú' : state.players.black.name;
  const whiteName = isSolo && state.humanPlayer === 'white' ? 'Tú' : state.players.white.name;
  const difficultyLabel: Record<string, string> = { easy: 'Fácil', normal: 'Normal', hard: 'Difícil' };
  const cpuSide: 'black' | 'white' | null = isSolo ? (state.humanPlayer === 'black' ? 'white' : 'black') : null;

  return (
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      {/* Scoreboard — 7-segment display */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: '#0a0a0a', borderRadius: 12, padding: '12px 24px',
        marginBottom: 16, border: '2px solid #222', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: state.players.black.color, border: '1px solid rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1, textTransform: 'uppercase' }} title={cpuSide === 'black' ? `Dificultad: ${difficultyLabel[state.difficulty]}` : undefined}>{blackName}</span>
            </div>
            <span style={glowStyle(state.players.black.color)}>{String(state.score.black).padStart(2, '0')}</span>
          </div>

          <span style={{ fontFamily: segmentFont, fontSize: 28, opacity: 0.2, color: '#555' }}>-</span>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1, textTransform: 'uppercase' }} title={cpuSide === 'white' ? `Dificultad: ${difficultyLabel[state.difficulty]}` : undefined}>{whiteName}</span>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: state.players.white.color, border: '1px solid rgba(255,255,255,0.2)' }} />
            </div>
            <span style={glowStyle(state.players.white.color)}>{String(state.score.white).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state.phase === 'game-over' ? (
          <motion.div
            key="winner"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ fontSize: 24, fontWeight: 700 }}
          >
            {winnerText}
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
              <span style={{ fontSize: 18, fontWeight: 600 }}>{turnLabel}</span>
            </div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>
              {isCpuTurn ? 'Pensando...' : phaseLabels[state.phase]}
            </div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4, marginBottom: 12 }}>
              Piezas: {state.players.black.name} {state.piecesLeft.black} | {state.players.white.name} {state.piecesLeft.white}
              {state.phase === 'rotate-only' && ` | Rotaciones: ${state.extraRotations}/${MAX_EXTRA_ROTATIONS}`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
        {state.phase === 'move-opponent' && !isCpuTurn && (
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
          <>
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
              Revancha
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={onBackToMenu}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Menú
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { GameMode, Player, PlayerInfo } from '../types/game';
import { PIECE_COLORS } from '../types/game';

interface PlayerSetupProps {
  mode: GameMode;
  onReady: (players: Record<Player, PlayerInfo>) => void;
  onBack: () => void;
}

function ColorPicker({ selected, taken, onSelect }: { selected: string; taken: string | null; onSelect: (c: string) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
      {PIECE_COLORS.map((c) => {
        const isTaken = c === taken;
        return (
          <button
            key={c}
            disabled={isTaken}
            onClick={() => onSelect(c)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: c,
              border: selected === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
              cursor: isTaken ? 'not-allowed' : 'pointer',
              opacity: isTaken ? 0.25 : 1,
              transition: 'transform 0.15s',
              transform: selected === c ? 'scale(1.2)' : 'scale(1)',
            }}
          />
        );
      })}
    </div>
  );
}

function randomColorExcluding(exclude: string): string {
  const options = PIECE_COLORS.filter((c) => c !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

export function PlayerSetup({ mode, onReady, onBack }: PlayerSetupProps) {
  const [name1, setName1] = useState('');
  const [color1, setColor1] = useState(PIECE_COLORS[0]);
  const [name2, setName2] = useState('');
  const [color2, setColor2] = useState(PIECE_COLORS[1]);

  const isSolo = mode === 'solo';
  const canStart = name1.trim().length > 0 && (isSolo || (name2.trim().length > 0 && color1 !== color2));

  const handleStart = () => {
    if (isSolo) {
      const cpuColor = randomColorExcluding(color1);
      onReady({
        black: { name: name1.trim(), color: color1 },
        white: { name: 'CPU', color: cpuColor },
      });
    } else {
      onReady({
        black: { name: name1.trim(), color: color1 },
        white: { name: name2.trim(), color: color2 },
      });
    }
  };

  const inputStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, maxWidth: 340 }}
    >
      <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>
        {isSolo ? '🤖 Configurar partida' : '👥 Configurar jugadores'}
      </h2>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 13, opacity: 0.7 }}>{isSolo ? 'Tu nombre' : 'Jugador 1'}</label>
        <input
          type="text"
          placeholder="Nombre"
          maxLength={16}
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          style={inputStyle}
        />
        <ColorPicker selected={color1} taken={isSolo ? null : color2} onSelect={setColor1} />
      </div>

      {!isSolo && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 13, opacity: 0.7 }}>Jugador 2</label>
          <input
            type="text"
            placeholder="Nombre"
            maxLength={16}
            value={name2}
            onChange={(e) => setName2(e.target.value)}
            style={inputStyle}
          />
          <ColorPicker selected={color2} taken={color1} onSelect={setColor2} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 14,
          }}
        >
          ← Volver
        </button>
        <motion.button
          whileHover={canStart ? { scale: 1.05 } : {}}
          whileTap={canStart ? { scale: 0.95 } : {}}
          disabled={!canStart}
          onClick={handleStart}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: canStart ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
            color: '#fff', cursor: canStart ? 'pointer' : 'not-allowed', fontSize: 14, fontWeight: 600,
            opacity: canStart ? 1 : 0.5,
          }}
        >
          Iniciar 🎮
        </motion.button>
      </div>
    </motion.div>
  );
}

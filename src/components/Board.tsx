import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface CellRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function Board({ state, selectedPiece, validMoves, onCellClick, onRotate }: BoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellRects, setCellRects] = useState<CellRect[]>([]);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const cells = containerRef.current.querySelectorAll('.cell');
    const rects: CellRect[] = [];
    cells.forEach((cell) => {
      const r = cell.getBoundingClientRect();
      rects.push({
        x: r.left - container.left,
        y: r.top - container.top,
        w: r.width,
        h: r.height,
      });
    });
    setCellRects(rects);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return (
    <div
      ref={containerRef}
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
          index={i}
          onClick={() => onCellClick(i)}
          isSelected={selectedPiece === i}
          isValidMove={validMoves.includes(i)}
          isWinning={state.winningCells?.includes(i) ?? false}
          hasPiece={cell !== null}
        />
      ))}

      <AnimatePresence>
        {state.board.map((cell, i) => {
          if (!cell || !cellRects[i]) return null;
          const rect = cellRects[i];
          const color = cell.player === 'black' ? '#1a1a2e' : '#f0e6d3';
          const shadow = cell.player === 'black' ? '#0d0d1a' : '#d4c9b8';
          const isWinning = state.winningCells?.includes(i) ?? false;
          const size = rect.w * 0.7;

          const left = rect.x + (rect.w - size) / 2;
          const top = rect.y + (rect.h - size) / 2;

          return (
            <motion.div
              key={cell.id}
              initial={false}
              animate={{
                left,
                top,
                scale: 1,
                opacity: 1,
                boxShadow: isWinning
                  ? '0 0 20px 6px rgba(255, 215, 0, 0.8)'
                  : `0 4px 8px ${shadow}`,
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${
                  cell.player === 'black' ? '#2d2d4a' : '#fff8ef'
                }, ${color})`,
                border: `2px solid ${shadow}`,
                pointerEvents: 'none',
                zIndex: 5,
              }}
            />
          );
        })}
      </AnimatePresence>

      <OrbitButton onClick={onRotate} disabled={state.phase !== 'rotate' && state.phase !== 'rotate-only'} />
    </div>
  );
}

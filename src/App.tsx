import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Board } from './components/Board';
import { ModeSelect } from './components/ModeSelect';
import { PlayerSetup } from './components/PlayerSetup';
import { PlayerSpinner } from './components/PlayerSpinner';
import { RulesPanel } from './components/RulesPanel';
import { StatusBar } from './components/StatusBar';
import { useGameState } from './hooks/useGameState';
import type { Difficulty, GameMode, Player, PlayerInfo } from './types/game';

type Screen = 'menu' | 'player-setup' | 'spinner' | 'game';

export default function App() {
  const {
    state, selectedPiece, validMoves,
    handleCellClick, handleRotate, skipMovePhase,
    reset, startGame, continueGame, hasSavedGame, backToMenu, isCpuTurn,
  } = useGameState();

  const [screen, setScreen] = useState<Screen>('menu');
  const [pendingMode, setPendingMode] = useState<GameMode>('vs');
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>('easy');
  const [pendingPlayers, setPendingPlayers] = useState<Record<Player, PlayerInfo> | null>(null);

  const handleModeStart = useCallback((mode: string, difficulty: string) => {
    setPendingMode(mode as GameMode);
    setPendingDifficulty(difficulty as Difficulty);
    setScreen('player-setup');
  }, []);

  const handleContinue = useCallback(() => {
    continueGame();
    setScreen('game');
  }, [continueGame]);

  const handlePlayersReady = useCallback((players: Record<Player, PlayerInfo>) => {
    setPendingPlayers(players);
    setScreen('spinner');
  }, []);

  const handleSpinnerDone = useCallback((starter: Player) => {
    if (!pendingPlayers) return;
    // For solo mode, the humanPlayer is whichever side has the human name (always 'black' from setup)
    startGame(pendingMode, pendingDifficulty, pendingPlayers, starter);
    setScreen('game');
  }, [pendingPlayers, pendingMode, pendingDifficulty, startGame]);

  const handleBackToMenu = useCallback(() => {
    backToMenu();
    setScreen('menu');
  }, [backToMenu]);

  const wrapper = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    color: '#fff',
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: '24px 0',
  };

  if (screen === 'menu' || (!state && screen === 'game')) {
    return (
      <div style={wrapper}>
        <ModeSelect onStart={handleModeStart} hasSavedGame={hasSavedGame} onContinue={handleContinue} />
      </div>
    );
  }

  if (screen === 'player-setup') {
    const backTarget = pendingMode === 'solo' ? 'menu' : 'menu';
    return (
      <div style={wrapper}>
        <PlayerSetup mode={pendingMode} onReady={handlePlayersReady} onBack={() => setScreen(backTarget)} />
      </div>
    );
  }

  if (screen === 'spinner' && pendingPlayers) {
    return (
      <div style={wrapper}>
        <PlayerSpinner players={pendingPlayers} onDone={handleSpinnerDone} />
      </div>
    );
  }

  if (!state) return null;

  return (
    <div style={wrapper}>
      <h1 style={{ fontSize: 32, fontWeight: 800, margin: '26px 0', letterSpacing: 4 }}>
        🪐 ORBIT
      </h1>
      <StatusBar
        state={state}
        isCpuTurn={isCpuTurn}
        onSkipMove={skipMovePhase}
        onReset={reset}
        onBackToMenu={handleBackToMenu}
      />
      <Board
        state={state}
        selectedPiece={selectedPiece}
        validMoves={validMoves}
        onCellClick={handleCellClick}
        onRotate={handleRotate}
      />
      {state.phase !== 'game-over' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToMenu}
          style={{
            marginTop: 16,
            padding: '8px 20px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          🏠 Menú
        </motion.button>
      )}
      <RulesPanel />
    </div>
  );
}

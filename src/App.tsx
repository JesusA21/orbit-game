import { Board } from './components/Board';
import { ModeSelect } from './components/ModeSelect';
import { RulesPanel } from './components/RulesPanel';
import { StatusBar } from './components/StatusBar';
import { useGameState } from './hooks/useGameState';

export default function App() {
  const {
    state, selectedPiece, validMoves,
    handleCellClick, handleRotate, skipMovePhase,
    reset, startGame, backToMenu, isCpuTurn,
  } = useGameState();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color: '#fff',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '24px 0',
      }}
    >
      {!state ? (
        <ModeSelect onStart={startGame} />
      ) : (
        <>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: 4 }}>
            ORBIT
          </h1>
          <StatusBar
            state={state}
            isCpuTurn={isCpuTurn}
            onSkipMove={skipMovePhase}
            onReset={reset}
            onBackToMenu={backToMenu}
          />
          <Board
            state={state}
            selectedPiece={selectedPiece}
            validMoves={validMoves}
            onCellClick={handleCellClick}
            onRotate={handleRotate}
          />
          <RulesPanel />
        </>
      )}
    </div>
  );
}

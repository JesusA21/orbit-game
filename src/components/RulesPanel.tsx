export function RulesPanel() {
  return (
    <div
      style={{
        marginTop: 32,
        padding: 24,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.08)',
        maxWidth: 360,
        width: '100%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        fontSize: 13,
        lineHeight: 1.8,
        opacity: 0.85,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📜 Reglas</h3>

      <p style={{ marginBottom: 12 }}>
        El juego consta de un turno por jugador hasta que se terminen las piezas
        o un jugador conecte <strong>4 de sus fichas en línea</strong>.
      </p>

      <p style={{ fontWeight: 600, marginBottom: 4 }}>Cada turno tiene 3 fases:</p>
      <ol style={{ paddingLeft: 18, marginBottom: 12 }}>
        <li><strong>Mover pieza rival</strong> (opcional) — mueve una pieza del oponente a una casilla adyacente vacía</li>
        <li><strong>Colocar pieza</strong> — coloca una ficha en cualquier casilla vacía</li>
        <li><strong>Rotar</strong> — presiona el botón central para rotar todas las fichas en sus órbitas</li>
      </ol>

      <p style={{ fontWeight: 600, marginBottom: 4 }}>Victoria y empate:</p>
      <ul style={{ paddingLeft: 18 }}>
        <li>Gana el primer jugador en conectar <strong>4 en línea</strong> (horizontal, vertical o diagonal) después de presionar el botón central</li>
        <li>Si se agotan las piezas sin ganador, se presiona el botón central hasta <strong>10 veces</strong> — gana quien conecte 4 primero</li>
        <li>Si ambos jugadores conectan 4 al mismo tiempo, es <strong>empate</strong></li>
        <li>Si nadie gana tras las 10 rotaciones extra, es <strong>empate</strong></li>
      </ul>
    </div>
  );
}

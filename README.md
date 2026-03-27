# 🪐 Orbit

Juego de mesa digital para 2 jugadores en un tablero 4x4 con mecánica de rotación orbital.

## Reglas del juego

1. Cada turno tiene 3 fases:
   - **Mover pieza rival** (opcional): mueve una pieza del oponente a una casilla adyacente vacía (horizontal o vertical)
   - **Colocar pieza**: coloca una de tus fichas en cualquier casilla vacía
   - **Rotar**: presiona el botón central para rotar todas las fichas en sus órbitas
2. Gana el primer jugador en conectar **4 fichas en línea** (horizontal, vertical o diagonal)
3. La rotación mueve las fichas en dos órbitas concéntricas en sentido horario:
   - **Órbita exterior**: 12 celdas del borde
   - **Órbita interior**: 4 celdas centrales

## Tecnologías

- React 19 + TypeScript
- Vite
- Framer Motion (animaciones)

## Estructura del proyecto

```
src/
├── types/game.ts          # Tipos e interfaces del juego
├── engine/gameEngine.ts   # Lógica: rotación, victoria, turnos
├── hooks/useGameState.ts  # Hook de estado del juego
├── components/
│   ├── Board.tsx          # Tablero 4x4 con botón central
│   ├── Cell.tsx           # Celda individual
│   ├── Piece.tsx          # Ficha animada
│   ├── OrbitButton.tsx    # Botón de rotación
│   └── StatusBar.tsx      # Turno, fase y controles
├── App.tsx                # Componente raíz
├── main.tsx               # Entry point
└── index.css              # Estilos globales
```

## Comandos

### Instalar dependencias

```bash
npm install
```

### Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre http://localhost:5173 en el navegador. El servidor tiene hot reload automático.

### Detener servidor

Presiona `Ctrl + C` en la terminal donde se ejecutó `npm run dev`.

### Lint

```bash
npm run lint
```

### Build de producción

```bash
npm run build
```

### Previsualizar build de producción

```bash
npm run preview
```

Sirve el build en http://localhost:4173. Detener con `Ctrl + C`.

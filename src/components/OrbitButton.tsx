import { motion } from 'framer-motion';

interface OrbitButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function OrbitButton({ onClick, disabled }: OrbitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: 'none',
        background: disabled
          ? 'rgba(100,100,100,0.4)'
          : 'linear-gradient(135deg, #f59e0b, #ef4444)',
        color: '#fff',
        fontSize: 22,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        boxShadow: disabled
          ? 'none'
          : '0 0 20px rgba(245, 158, 11, 0.5)',
      }}
    >
      <motion.span
        animate={!disabled ? { rotate: [0, 360] } : { rotate: 0 }}
        transition={
          !disabled
            ? { duration: 3, repeat: Infinity, ease: 'linear' }
            : {}
        }
        style={{ display: 'inline-block' }}
      >
        ⟳
      </motion.span>
    </button>
  );
}

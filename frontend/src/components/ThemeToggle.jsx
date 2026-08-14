import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ theme, onToggle, id = 'theme-toggle' }) {
  return (
    <motion.button
      id={id}
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.25 }}
      >
        {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
      </motion.span>
    </motion.button>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useTypewriter } from '../hooks/useTypewriter';
import { TiltCard } from './TiltCard';

// Default hero script: typed commands with output lines.
const buildScript = () => [
  { type: 'cmd', text: 'whoami', speed: 68, hold: 420 },
  { type: 'out', text: '→ Full Stack Developer', color: 'accent' },
  { type: 'pause', ms: 500 },
  { type: 'cmd', text: 'npm run dev', speed: 52, hold: 420 },
  { type: 'out', text: 'starting development server...', color: 'dim' },
  { type: 'out', text: 'compiling components...', color: 'dim' },
  { type: 'out', text: '✓ system check: no issues', color: 'ok' },
  { type: 'out', text: '✓ server running on port 3000', color: 'ok' },
  { type: 'pause', ms: 560 },
  { type: 'cmd', text: 'build()', speed: 66, hold: 420 },
  { type: 'out', text: '→ digital experiences', color: 'accent' },
  { type: 'out', text: 'ready to ship ✦', color: 'ok' },
];

// Convert About's [{ id, command, output: [...] }] into typewriter steps.
function normalizeScript(script, typingDelay, outputDelay) {
  if (!script) return null;
  return script.flatMap((block) => [
    { type: 'cmd', text: block.command, speed: typingDelay, hold: 340 },
    ...(block.output || []).map((line) => ({
      type: 'out',
      text: line,
      delay: outputDelay,
      hold: 180,
    })),
    { type: 'pause', ms: 240 },
  ]);
}

// Premium animated terminal window: typing effect, blinking cursor,
// traffic-light dots, scanline and a subtle tilt + hover glow.
//
// - No props → the default hero script (loops).
// - About passes `script` ([{ command, output }]) + `title` + delays (types once).
export function Terminal({
  className = '',
  script,
  title = 'vijay@dev — zsh',
  typingDelay = 30,
  outputDelay = 150,
  compact = false,
}) {
  const reduced = usePrefersReducedMotion();
  const steps = useMemo(() => normalizeScript(script, typingDelay, outputDelay) ?? buildScript(), [
    script,
    typingDelay,
    outputDelay,
  ]);
  const [cycle, setCycle] = useState(0);
  const { done, active, finished } = useTypewriter({
    script: steps,
    startDelay: 600,
    reduced,
    cycle,
  });

  // Only the default hero terminal loops; custom scripts run once.
  useEffect(() => {
    if (!finished || reduced || script) return;
    const t = setTimeout(() => setCycle((c) => c + 1), 4200);
    return () => clearTimeout(t);
  }, [finished, reduced, script]);

  const idle = !active && (finished || done.length === 0);

  return (
    <TiltCard
      className={`terminal ${className}${compact ? ' terminal-compact' : ''}`.trim()}
      max={3}
      lift={3}
    >
      <div className="terminal-bar">
        <div className="terminal-dots">
          <span className="terminal-dot d-red" aria-hidden="true" />
          <span className="terminal-dot d-yellow" aria-hidden="true" />
          <span className="terminal-dot d-green" aria-hidden="true" />
        </div>
        <span className="terminal-title">{title}</span>
        <span className="terminal-status">
          <span className="terminal-status-dot" aria-hidden="true" />
          online
        </span>
      </div>

      <div className="terminal-body">
        {done.map((line, i) =>
          line.type === 'cmd' ? (
            <div className="term-cmd" key={i}>
              <span className="term-prompt">$</span>
              <span>{line.text}</span>
            </div>
          ) : (
            <div className={`term-out${line.color ? ` term-${line.color}` : ''}`} key={i}>
              <span className="term-arrow">→</span>
              <span>{line.text}</span>
            </div>
          )
        )}

        {active && (
          <div className="term-cmd">
            <span className="term-prompt">$</span>
            <span>{active.text}</span>
            <span className="term-cursor" aria-hidden="true" />
          </div>
        )}

        {idle && (
          <div className="term-cmd">
            <span className="term-prompt">$</span>
            <span className="term-cursor" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="terminal-scanline" aria-hidden="true" />
    </TiltCard>
  );
}

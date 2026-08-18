import { useEffect, useState } from 'react';

// Reusable typing engine for terminal-style components.
//
// Script steps:
//   { type: 'cmd',   text: 'whoami', speed: 60, hold: 500, color: 'cmd' }
//   { type: 'out',   text: '...',    delay: 260, hold: 620, color: 'out' | 'accent' | 'ok' | 'dim' }
//   { type: 'pause', ms: 700 }
//
// `cycle` is bumped by the caller to restart the sequence (looping terminals).
export function useTypewriter({ script, startDelay = 0, reduced = false, cycle = 0 }) {
  const [done, setDone] = useState([]);
  const [active, setActive] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers = [];

    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    if (reduced) {
      setDone(
        script
          .filter((s) => s.type === 'cmd' || s.type === 'out')
          .map((s) => ({ type: s.type, text: s.text, color: s.color }))
      );
      setActive(null);
      setFinished(true);
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    const run = async () => {
      setDone([]);
      setActive(null);
      setFinished(false);
      await wait(startDelay);

      const completed = [];
      for (const step of script) {
        if (cancelled) return;

        if (step.type === 'cmd') {
          setActive({ text: '', target: step.text, color: step.color });
          for (let i = 1; i <= step.text.length; i++) {
            await wait(step.speed || 60);
            if (cancelled) return;
            setActive({ text: step.text.slice(0, i), target: step.text, color: step.color });
          }
          completed.push({ type: 'cmd', text: step.text, color: step.color });
          setDone([...completed]);
          setActive(null);
          await wait(step.hold ?? 500);
        } else if (step.type === 'out') {
          await wait(step.delay ?? 260);
          completed.push({ type: 'out', text: step.text, color: step.color });
          setDone([...completed]);
          await wait(step.hold ?? 620);
        } else if (step.type === 'pause') {
          await wait(step.ms ?? 700);
        }
      }

      if (cancelled) return;
      setFinished(true);
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [script, startDelay, reduced, cycle]);

  return { done, active, finished };
}

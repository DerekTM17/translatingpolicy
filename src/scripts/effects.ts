/**
 * Pointer effects from the approved mockup: a page glow that follows the cursor
 * (`--mx/--my` on body) and a spotlight inside each project row (`--px/--py`).
 * Skipped on touch screens and for reduced motion, which get the resting design.
 */
export function initEffects(): void {
  if (matchMedia('(hover: none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('pointermove', (e) => {
    document.body.style.setProperty('--mx', `${e.clientX}px`);
    document.body.style.setProperty('--my', `${e.clientY}px`);
  });

  document.querySelectorAll<HTMLElement>('.rowc').forEach((row) => {
    row.addEventListener('pointermove', (e) => {
      const r = row.getBoundingClientRect();
      row.style.setProperty('--px', `${e.clientX - r.left}px`);
      row.style.setProperty('--py', `${e.clientY - r.top}px`);
    });
  });
}

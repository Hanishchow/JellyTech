/* ============================================================
   JELLYTECH boot tetris.

   A self-playing board behind the loading ident, from the Originkit "Tetris"
   component. That original is React, but its whole body is already plain
   canvas 2D inside an effect, so this is the same logic without the framework.

   Restored from the portfolio adaptation back toward the original:

   · COLOUR. The adaptation drew everything in two tints of one ink because it
     lived on a page that flipped between white and black. This does not: the
     board gets the original's seven-piece palette, retuned to the club's
     violet so the loading screen and the site are the same object.
   · ITS OWN CLOCK. The adaptation played the sequence back against a loading
     percentage, which meant the board froze whenever the page did. Pieces fall
     on a real gravity timer again, and the board keeps playing for as long as
     the load takes: when it runs out of planned pieces it plans more.

   Kept from the adaptation: it tears itself down the moment the loader is
   done, rather than idling behind a hidden layer.
   ============================================================ */
(function () {
  'use strict';

  const canvas = document.getElementById('bootTetris');
  const boot = document.getElementById('tl-screen');
  if (!canvas || !boot || !canvas.getContext) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');

  const SHAPES = [
    [[0,1],[1,1],[2,1],[3,1]],      // I
    [[0,0],[0,1],[1,1],[2,1]],      // J
    [[2,0],[0,1],[1,1],[2,1]],      // L
    [[1,0],[2,0],[0,1],[1,1]],      // S
    [[0,0],[1,0],[1,1],[2,1]],      // Z
    [[1,0],[0,1],[1,1],[2,1]],      // T
    [[0,0],[1,0],[0,1],[1,1]]       // O
  ];

  const CELL = 22, GAP = 2, ROUNDED = 6;
  const CLEAR_BLINKS = 2, BLINK_MS = 90;
  const WANDER = 0.4;

  /* Gravity, as in the original: milliseconds per row of fall, and a short
     pause once a piece locks before the next one enters. The board runs for as
     long as the load does and simply keeps playing, so none of this is tied to
     a percentage any more. */
  const FALL_MS = 62;       // per row
  const LOCK_MS = 90;       // beat between lock and next spawn
  const BASE_ROWS = 3;      // pre-filled rows, so a clear is reachable early

  /* deterministic: the same board plays out every load */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = mulberry32(0x7e7415);

  /* One colour per shape, as in the original. The hues are walked around the
     club's violet rather than the arcade's primaries, so the board reads as
     bioluminescence rather than as a game console. Index matches SHAPES. */
  const EMPTY = 'rgba(157, 78, 221, 0.07)';
  const BLOCKS = [
    'rgba(199, 125, 255, 0.92)',   // I  bright violet
    'rgba(157,  78, 221, 0.92)',   // J  brand violet
    'rgba(126,  58, 242, 0.92)',   // L  indigo
    'rgba(190,  92, 255, 0.92)',   // S  orchid
    'rgba(110,  70, 235, 0.92)',   // Z  deep indigo
    'rgba(214, 158, 255, 0.92)',   // T  pale lilac
    'rgba(168, 100, 246, 0.92)'    // O  mid violet
  ];
  const FLASH = 'rgba(245, 232, 255, 0.95)';
  const GLOW = 'rgba(157, 78, 221, 0.55)';

  let alive = true, raf = 0, last = 0;
  let dpr = 1, cols = 0, rows = 0, cellW = 0, cellH = 0, pitchX = 0, pitchY = 0, radius = 0;
  let grid = [], piece = null, clearing = [], clearMs = 0;

  const pitch = CELL + GAP;
  const at = (c, r) => grid[r * cols + c];

  function rotate(shape, turns) {
    let cells = SHAPES[shape].map(([c, r]) => [c, r]);
    for (let t = 0; t < turns; t++) {
      let maxRow = 0;
      for (const [, r] of cells) maxRow = Math.max(maxRow, r);
      cells = cells.map(([c, r]) => [maxRow - r, c]);
    }
    let minC = Infinity, minR = Infinity;
    for (const [c, r] of cells) { minC = Math.min(minC, c); minR = Math.min(minR, r); }
    return cells.map(([c, r]) => [c - minC, r - minR]);
  }

  function fits(cells, col, row) {
    for (const [c, r] of cells) {
      const gc = col + c, gr = row + r;
      if (gc < 0 || gc >= cols || gr >= rows) return false;
      if (gr >= 0 && at(gc, gr) !== -1) return false;
    }
    return true;
  }

  function landing(cells, col) {
    if (!fits(cells, col, 0)) return -1;
    let row = 0;
    while (fits(cells, col, row + 1)) row++;
    return row;
  }

  /* Dellacherie-style weights: reward clears, punish height, holes and a
     jagged surface. This is what makes it look like someone is playing. */
  function score(cells, col, row) {
    const test = grid.slice();
    for (const [c, r] of cells) {
      const gr = row + r;
      if (gr >= 0) test[gr * cols + (col + c)] = 1;
    }
    let lines = 0;
    for (let r = 0; r < rows; r++) {
      let full = true;
      for (let c = 0; c < cols; c++) if (test[r * cols + c] === -1) { full = false; break; }
      if (full) lines++;
    }
    let agg = 0, holes = 0, bump = 0, prevTop = -1;
    for (let c = 0; c < cols; c++) {
      let top = rows;
      for (let r = 0; r < rows; r++) if (test[r * cols + c] !== -1) { top = r; break; }
      agg += rows - top;
      for (let r = top + 1; r < rows; r++) if (test[r * cols + c] === -1) holes++;
      if (prevTop >= 0) bump += Math.abs(top - prevTop);
      prevTop = top;
    }
    return lines * 4 - agg * 0.5 - holes * 3.5 - bump * 0.3;
  }

  /* Choose a placement for one shape. `avoid` masks columns the planner must
     not build in — that is what keeps the finishing well open until the end. */
  function plan(shape) {
    const options = [];
    let bestScore = -Infinity;
    for (let turn = 0; turn < 4; turn++) {
      const cells = rotate(shape, turn);
      let width = 0;
      for (const [c] of cells) width = Math.max(width, c);
      for (let col = 0; col + width < cols; col++) {
        const row = landing(cells, col);
        if (row < 0) continue;
        const s = score(cells, col, row);
        if (s > bestScore) bestScore = s;
        options.push({ cells: cells, col: col, row: row, s: s });
      }
    }
    if (!options.length) return null;
    /* On a flat baseline dozens of placements score identically, and taking
       the first meant every piece stacked in the left corner while the closer
       came down the middle. Choose at random from everything within a hair of
       the best, so the board looks played across its whole width. */
    const near = options.filter((o) => o.s >= bestScore - 0.35);
    return near[Math.floor(rand() * near.length)] || options[0];
  }

  function stamp(cells, col, row, color) {
    for (const [c, r] of cells) {
      const gr = row + r, gc = col + c;
      if (gr >= 0 && gr < rows && gc >= 0 && gc < cols) grid[gr * cols + gc] = color;
    }
  }

  /* Seed the board mid-game. An empty well is no longer punched out, because
     there is no single finishing piece to drop into it: the planner is free to
     use the whole width, and lines clear whenever the planner manages to
     complete one. */
  function seedBoard() {
    for (let r = rows - BASE_ROWS; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid[r * cols + c] = Math.floor(rand() * BLOCKS.length);
      }
    }
    /* Punch the baseline full of holes so it reads as a played board rather
       than a printed pattern, and so the bottom row is not accidentally
       complete before the first piece lands. */
    for (let r = rows - BASE_ROWS; r < rows; r++) {
      const holes = r === rows - 1 ? 2 : 4;
      for (let n = 0; n < holes; n++) {
        grid[r * cols + Math.floor(rand() * cols)] = -1;
      }
    }
  }

  /* Choose the next piece and where it is going. Returns a falling piece, or
     null when the stack has reached the ceiling, in which case the caller
     clears the board and starts again. */
  function spawn() {
    const shape = Math.floor(rand() * SHAPES.length);
    const p = plan(shape);
    if (!p) return null;

    let top = 0, width = 0;
    for (const [c, r] of p.cells) {
      top = Math.max(top, r);
      width = Math.max(width, c);
    }
    const maxCol = cols - 1 - width;
    const swing = Math.round((rand() * 2 - 1) * WANDER * cols);

    return {
      cells: p.cells,
      color: shape,
      col: Math.min(maxCol, Math.max(0, p.col + swing)),
      targetCol: p.col,
      targetRow: p.row,
      row: -1 - top,
      startRow: -1 - top
    };
  }

  function collapse() {
    const gone = new Set(clearing);
    const next = new Array(cols * rows).fill(-1);
    let write = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      if (gone.has(r)) continue;
      for (let c = 0; c < cols; c++) next[write * cols + c] = grid[r * cols + c];
      write--;
    }
    grid = next;
    clearing = [];
  }

  function build() {
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth));
    const h = Math.max(1, Math.round(canvas.clientHeight));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(4, Math.floor((w + GAP) / pitch));
    rows = Math.max(6, Math.floor((h + GAP) / pitch));
    /* size cells to the count that fits, so the grid meets both edges exactly
       instead of leaving a half cell or a strip at the end */
    cellW = Math.max(1, (w - GAP * (cols - 1)) / cols);
    cellH = Math.max(1, (h - GAP * (rows - 1)) / rows);
    pitchX = cellW + GAP; pitchY = cellH + GAP;
    radius = (Math.min(cellW, cellH) / 2) * (Math.min(20, Math.max(0, ROUNDED)) / 20);
    grid = new Array(cols * rows).fill(-1);
    piece = null; clearing = []; clearMs = 0; fallMs = 0; lockMs = 0;
    seedBoard();
    piece = spawn();
  }

  function tile(col, row) {
    const x = col * pitchX, y = row * pitchY;
    if (radius > 0 && ctx.roundRect) ctx.roundRect(x, y, cellW, cellH, radius);
    else ctx.rect(x, y, cellW, cellH);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.beginPath();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tile(c, r);
    ctx.fillStyle = EMPTY;
    ctx.fill();

    const flashing = new Set(clearing);
    const lit = clearMs > 0 && Math.floor(clearMs / BLINK_MS) % 2 === 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const col = grid[r * cols + c];
        if (col === -1) continue;
        ctx.beginPath(); tile(c, r);
        ctx.fillStyle = (flashing.has(r) && lit) ? FLASH : BLOCKS[col] || BLOCKS[0];
        ctx.fill();
      }
    }
    if (piece) {
      /* The live piece is the only lit thing on the board, which is what makes
         the eye follow it down rather than reading the whole grid at once. */
      ctx.save();
      ctx.shadowColor = GLOW;
      ctx.shadowBlur = 18;
      ctx.fillStyle = BLOCKS[piece.color] || BLOCKS[0];
      for (const [c, r] of piece.cells) {
        const gr = piece.row + r;
        if (gr < -1) continue;
        ctx.beginPath(); tile(piece.col + c, gr); ctx.fill();
      }
      ctx.restore();
    }
  }

  let fallMs = 0, lockMs = 0;

  function loop(time) {
    if (!alive) return;
    const dt = last ? Math.min(time - last, 200) : 0;
    last = time;

    /* A line is clearing: blink it, then collapse. Nothing else moves. */
    if (clearMs > 0) {
      clearMs -= dt;
      if (clearMs <= 0) { clearMs = 0; collapse(); }
      draw();
      raf = requestAnimationFrame(loop);
      return;
    }

    /* Between pieces. */
    if (!piece) {
      lockMs -= dt;
      if (lockMs <= 0) {
        piece = spawn();
        /* Topped out: wipe and re-seed rather than freezing, since the loader
           may still have a long way to go. */
        if (!piece) {
          grid = new Array(cols * rows).fill(-1);
          seedBoard();
          piece = spawn();
        }
        fallMs = 0;
      }
      draw();
      raf = requestAnimationFrame(loop);
      return;
    }

    /* Falling. The piece drifts toward its planned column as it descends, so
       the horizontal move reads as steering rather than as teleporting. */
    fallMs += dt;
    while (fallMs >= FALL_MS) {
      fallMs -= FALL_MS;
      piece.row += 1;

      const span = piece.targetRow - piece.startRow;
      const progress = span > 0 ? (piece.row - piece.startRow) / span : 1;
      if (piece.col !== piece.targetCol && progress > 0.35) {
        piece.col += piece.col < piece.targetCol ? 1 : -1;
      }

      if (piece.row >= piece.targetRow) {
        stamp(piece.cells, piece.targetCol, piece.targetRow, piece.color);
        piece = null;
        lockMs = LOCK_MS;
        checkClears();
        break;
      }
    }

    draw();
    raf = requestAnimationFrame(loop);
  }

  function checkClears() {
    const full = [];
    for (let r = 0; r < rows; r++) {
      let solid = true;
      for (let c = 0; c < cols; c++) if (grid[r * cols + c] === -1) { solid = false; break; }
      if (solid) full.push(r);
    }
    if (full.length) { clearing = full; clearMs = CLEAR_BLINKS * BLINK_MS * 2; }
  }

  function stop() {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    if (mo) mo.disconnect();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  let built = '';
  let ro = null, mo = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => {
      const size = canvas.clientWidth + 'x' + canvas.clientHeight;
      if (size === built) return;
      built = size;
      build();
    });
    ro.observe(canvas);
  }

  /* tear down the moment the loader finishes — nothing should still be
     animating behind a hidden layer while the console is starting up */
  mo = new MutationObserver(() => { if (boot.classList.contains('is-done')) stop(); });
  mo.observe(boot, { attributes: true, attributeFilter: ['class'] });

  build();
  built = canvas.clientWidth + 'x' + canvas.clientHeight;
  raf = requestAnimationFrame(loop);
})();

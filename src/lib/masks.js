function createMask(drawFn, size = 200) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';
  drawFn(ctx, size);
  return ctx.getImageData(0, 0, size, size);
}

function mushroom(ctx, s) {
  const cx = s / 2;
  ctx.beginPath();
  ctx.arc(cx, s * 0.38, s * 0.32, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - s * 0.1, s * 0.38, s * 0.2, s * 0.28);
  ctx.beginPath();
  ctx.ellipse(cx, s * 0.66, s * 0.14, s * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  // spots on cap
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - s * 0.1, s * 0.22, s * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + s * 0.12, s * 0.18, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function heart(ctx, s) {
  const cx = s / 2, cy = s * 0.35, r = s * 0.22;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 1.6);
  ctx.bezierCurveTo(cx - r * 2, cy - r * 0.3, cx - r, cy - r * 1.2, cx, cy);
  ctx.bezierCurveTo(cx + r, cy - r * 1.2, cx + r * 2, cy - r * 0.3, cx, cy + r * 1.6);
  ctx.fill();
}

function crown(ctx, s) {
  const cx = s / 2, bw = s * 0.5, bh = s * 0.2, by = s * 0.6;
  ctx.fillRect(cx - bw / 2, by, bw, bh);
  const pw = bw / 3, ph = s * 0.25;
  ctx.beginPath();
  ctx.moveTo(cx - bw / 2, by);
  ctx.lineTo(cx - bw / 2 + pw * 0.2, by - ph);
  ctx.lineTo(cx - bw / 2 + pw * 0.8, by);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - pw / 2, by);
  ctx.lineTo(cx, by - ph * 1.1);
  ctx.lineTo(cx + pw / 2, by);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + bw / 2 - pw * 0.8, by);
  ctx.lineTo(cx + bw / 2 - pw * 0.2, by - ph);
  ctx.lineTo(cx + bw / 2, by);
  ctx.fill();
  // dots on tips
  ctx.beginPath();
  ctx.arc(cx - bw / 2 + pw * 0.2, by - ph, s * 0.03, 0, Math.PI * 2);
  ctx.arc(cx, by - ph * 1.1, s * 0.03, 0, Math.PI * 2);
  ctx.arc(cx + bw / 2 - pw * 0.2, by - ph, s * 0.03, 0, Math.PI * 2);
  ctx.fill();
}

function spade(ctx, s) {
  const cx = s / 2, top = s * 0.15, r = s * 0.15;
  ctx.beginPath();
  ctx.arc(cx, top + r, r, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - r, top + r);
  ctx.quadraticCurveTo(cx, s * 0.5, cx, s * 0.6);
  ctx.quadraticCurveTo(cx, s * 0.5, cx + r, top + r);
  ctx.fill();
  ctx.fillRect(cx - s * 0.03, s * 0.6, s * 0.06, s * 0.2);
}

function star(ctx, s) {
  const cx = s / 2, cy = s / 2, or = s * 0.4, ir = s * 0.17, spikes = 5;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? or : ir;
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

export const maskDrawers = { mushroom, heart, crown, spade, star };

export function generateMaskConfigs() {
  return [
    {
      id: 'mushroom',
      label: 'Mushroom',
      maskData: createMask(mushroom),
      palette: ['#c084fc', '#f472b6', '#60a5fa'],
      gridSize: 20,
      spacing: 0.6,
    },
    {
      id: 'crown',
      label: 'Crown',
      maskData: createMask(crown),
      palette: ['#facc15', '#eab308', '#f59e0b'],
      gridSize: 20,
      spacing: 0.6,
    },
    {
      id: 'spade',
      label: 'Spade',
      maskData: createMask(spade),
      palette: ['#818cf8', '#6366f1', '#a78bfa'],
      gridSize: 20,
      spacing: 0.6,
    },
    {
      id: 'star',
      label: 'Star',
      maskData: createMask(star),
      palette: ['#34d399', '#22d3ee', '#818cf8'],
      gridSize: 20,
      spacing: 0.6,
    },
  ];
}

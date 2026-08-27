const INK = "#0f172a";
const TEAL = "#009688";
const FILL = "#99f6e4";
const WHITE = "#ffffff";
const AMBER = "#fcd34d";
const ROSE = "#fda4af";

export function tile(inner, { size = 78 } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">
    <rect x="2" y="2" width="96" height="96" rx="8" fill="${WHITE}" stroke="${INK}" stroke-width="3"/>
    ${inner}
  </svg>`;
}

function shapeFill(kind) {
  if (kind === "solid") return TEAL;
  if (kind === "pale") return FILL;
  if (kind === "amber") return AMBER;
  if (kind === "rose") return ROSE;
  return WHITE;
}

export function circle({ fill = "none", r = 22, cx = 50, cy = 50 } = {}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${shapeFill(fill)}" stroke="${INK}" stroke-width="3"/>`;
}

export function square({ fill = "none", s = 40, rot = 0 } = {}) {
  const x = 50 - s / 2;
  const y = 50 - s / 2;
  return `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${shapeFill(fill)}" stroke="${INK}" stroke-width="3" transform="rotate(${rot} 50 50)"/>`;
}

export function diamond({ fill = "none", s = 44 } = {}) {
  return square({ fill, s, rot: 45 });
}

export function triangle({ fill = "none", dir = "up" } = {}) {
  const points = {
    up: "50,18 82,82 18,82",
    down: "18,18 82,18 50,82",
    left: "82,18 82,82 18,50",
    right: "18,18 82,18 82,82 18,50".split(" ").slice(0, 3).join(" ") || "18,18 82,50 18,82",
  };
  const map = {
    up: "50,18 82,82 18,82",
    down: "18,18 82,18 50,82",
    left: "82,18 82,82 18,50",
    right: "18,18 82,50 18,82",
  };
  return `<polygon points="${map[dir] || map.up}" fill="${shapeFill(fill)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
}

export function plus({ rot = 0 } = {}) {
  return `<g transform="rotate(${rot} 50 50)" fill="${INK}">
    <rect x="44" y="18" width="12" height="64" rx="2"/>
    <rect x="18" y="44" width="64" height="12" rx="2"/>
  </g>`;
}

export function arrow({ dir = "right", fill = "solid" } = {}) {
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir] || 0;
  return `<g transform="rotate(${rot} 50 50)">
    <polygon points="18,50 58,22 58,38 84,38 84,62 58,62 58,78" fill="${shapeFill(fill)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  </g>`;
}

export function dots(n, { fill = "solid" } = {}) {
  const positions = {
    1: [[50, 50]],
    2: [[32, 50], [68, 50]],
    3: [[32, 32], [68, 32], [50, 68]],
    4: [[32, 32], [68, 32], [32, 68], [68, 68]],
    5: [[32, 32], [68, 32], [50, 50], [32, 68], [68, 68]],
  };
  return (positions[n] || positions[1])
    .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="8" fill="${shapeFill(fill)}" stroke="${INK}" stroke-width="2"/>`)
    .join("");
}

export function bars(n) {
  const start = 50 - (n * 10);
  return Array.from({ length: n }, (_, i) => {
    const x = start + i * 18;
    return `<rect x="${x}" y="24" width="10" height="52" rx="2" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>`;
  }).join("");
}

export function ringDot({ rot = 0 } = {}) {
  return `<g transform="rotate(${rot} 50 50)">
    <circle cx="50" cy="50" r="26" fill="none" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="24" r="8" fill="${TEAL}" stroke="${INK}" stroke-width="2"/>
  </g>`;
}

export function combo(parts) {
  return parts.join("");
}

export function row(tiles, label) {
  const bits = tiles.map((item) => (typeof item === "string" ? item : tile(item))).join("");
  return `<div class="nvr-row">${label ? `<span class="nvr-label">${label}</span>` : ""}${bits}</div>`;
}

export function choiceTiles(options) {
  return options.map((option) => {
    const html = typeof option === "string" ? option : tile(option);
    return { html };
  });
}

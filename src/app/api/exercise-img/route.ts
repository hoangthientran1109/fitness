import { NextRequest, NextResponse } from 'next/server';

import { getExerciseImage, REPO_URL } from '@/lib/exercise-images';

// === SVG ANATOMY ENGINE ===

const C_BODY = '#334155';
const C_BODY_FADE = '#475569';
const C_SKIN = '#fed7aa';
const C_SKIN_FADE = '#fdba74';
const C_JOINT = '#94a3b8';
const C_EQUIP = '#64748b';
const C_EQUIP_ACCENT = '#475569';
const C_ARROW = '#22d3ee';
const C_MUSCLE_MAIN = 'rgba(34,211,238,0.45)';
const C_MUSCLE_SEC = 'rgba(34,211,238,0.2)';
const C_LABEL = '#e2e8f0';
const C_LABEL_FADE = '#94a3b8';

function svgHead(cx: number, cy: number): string {
  return `
    <g opacity="0.95">
      <ellipse cx="${cx}" cy="${cy}" rx="16" ry="18" fill="${C_SKIN}" stroke="${C_BODY}" stroke-width="1.5"/>
      <ellipse cx="${cx - 5}" cy="${cy - 3}" rx="2.5" ry="3" fill="${C_BODY}" opacity="0.6"/>
      <ellipse cx="${cx + 5}" cy="${cy - 3}" rx="2.5" ry="3" fill="${C_BODY}" opacity="0.6"/>
      <path d="M${cx - 6} ${cy + 8} Q${cx} ${cy + 12} ${cx + 6} ${cy + 8}" fill="none" stroke="${C_BODY}" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <path d="M${cx - 7} ${cy - 14} Q${cx} ${cy - 22} ${cx + 7} ${cy - 14} Z" fill="#1e293b" opacity="0.5"/>
    </g>`;
}

function limbColor(muscleZone: string, isActive: boolean): string {
  if (!isActive) return C_BODY_FADE;
  const m = muscleZone.toLowerCase();
  if (m.includes('ngực') || m.includes('chest')) return 'rgba(251,146,60,0.5)';
  if (m.includes('xô') || m.includes('lưng') || m.includes('lats') || m.includes('back')) return 'rgba(59,130,246,0.5)';
  if (m.includes('vai') || m.includes('shoulder') || m.includes('delt')) return 'rgba(245,158,11,0.5)';
  if (m.includes('tay trước') || m.includes('biceps')) return 'rgba(168,85,247,0.5)';
  if (m.includes('tay sau') || m.includes('triceps')) return 'rgba(239,68,68,0.5)';
  if (m.includes('đùi') || m.includes('quad') || m.includes('leg')) return 'rgba(6,182,212,0.5)';
  if (m.includes('mông') || m.includes('glutes') || m.includes('đùi sau') || m.includes('hamstring')) return 'rgba(20,184,166,0.5)';
  if (m.includes('bụng') || m.includes('abs') || m.includes('core')) return 'rgba(234,88,12,0.5)';
  if (m.includes('cơ dựng') || m.includes('erector')) return 'rgba(29,78,216,0.5)';
  if (m.includes('cầu') || m.includes('trap')) return 'rgba(120,113,108,0.5)';
  if (m.includes('bắp chân') || m.includes('calf')) return 'rgba(132,204,22,0.5)';
  if (m.includes('cơ liên') || m.includes('oblique')) return 'rgba(194,65,12,0.5)';
  return C_MUSCLE_MAIN;
}

// Draw a proper human figure with anatomical shapes
function drawAnatomyFigure(
  cx: number,
  points: Record<string, { x: number; y: number }>,
  opacity: number,
  muscleZone: string,
  equipment: string
): string {
  const o = opacity;
  const col = opacity < 0.5 ? C_BODY_FADE : C_BODY;
  const fillCol = opacity < 0.5 ? '#1e293b' : '#1e293b';
  const activeMuscle = opacity >= 0.6;
  const mColor = limbColor(muscleZone, activeMuscle);
  const mColorSec = activeMuscle ? mColor.replace('0.5', '0.2').replace('0.45', '0.15') : 'none';

  const h = points.head || { x: cx, y: 40 };
  const neck = points.neck || { x: h.x, y: h.y + 18 };
  const lSh = points.lShoulder || { x: h.x - 26, y: neck.y + 8 };
  const rSh = points.rShoulder || { x: h.x + 26, y: neck.y + 8 };
  const lEl = points.lElbow || { x: lSh.x - 12, y: lSh.y + 38 };
  const rEl = points.rElbow || { x: rSh.x + 12, y: rSh.y + 38 };
  const lWr = points.lWrist || { x: lEl.x - 8, y: lEl.y + 32 };
  const rWr = points.rWrist || { x: rEl.x + 8, y: rEl.y + 32 };
  const hip = points.hip || { x: h.x, y: neck.y + 50 };
  const lHip = points.lHip || { x: hip.x - 14, y: hip.y };
  const rHip = points.rHip || { x: hip.x + 14, y: hip.y };
  const lKn = points.lKnee || { x: lHip.x - 2, y: lHip.y + 46 };
  const rKn = points.rKnee || { x: rHip.x + 2, y: rHip.y + 46 };
  const lAn = points.lAnkle || { x: lKn.x - 1, y: lKn.y + 42 };
  const rAn = points.rAnkle || { x: rKn.x + 1, y: rKn.y + 42 };

  // Torso with anatomical shape (wider shoulders, taper to waist, flare to hips)
  const torsoPath = `M${lSh.x} ${lSh.y} C${lSh.x - 5} ${lSh.y + 15},${hip.x - 18} ${hip.y - 10},${hip.x - 14} ${hip.y} Q${hip.x} ${hip.y + 6} ${hip.x + 14} ${hip.y} C${hip.x + 18} ${hip.y - 10},${rSh.x + 5} ${rSh.y + 15},${rSh.x} ${rSh.y} Z`;

  return `
    <g opacity="${o}">
      <!-- Torso -->
      <path d="${torsoPath}" fill="${fillCol}" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/>
      ${activeMuscle ? `<path d="${torsoPath}" fill="${mColor}" stroke="none" opacity="0.6"/>` : ''}

      <!-- Neck -->
      <path d="M${neck.x - 6} ${neck.y} L${neck.x + 6} ${neck.y} L${h.x - 4} ${h.y + 12} L${h.x + 4} ${h.y + 12} Z" fill="${C_SKIN}" stroke="${col}" stroke-width="1" opacity="${Math.min(o * 1.2, 1)}"/>

      <!-- Head -->
      ${svgHead(h.x, h.y)}

      <!-- Left arm -->
      <path d="M${lSh.x} ${lSh.y} C${lSh.x - 8} ${lSh.y + 12},${lEl.x - 4} ${lEl.y - 8},${lEl.x} ${lEl.y} C${lEl.x - 4} ${lEl.y + 8},${lWr.x - 2} ${lWr.y - 6},${lWr.x} ${lWr.y}" 
        fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      ${activeMuscle ? `
        <path d="M${lSh.x} ${lSh.y} C${lSh.x - 8} ${lSh.y + 12},${lEl.x - 4} ${lEl.y - 8},${lEl.x} ${lEl.y} C${lEl.x - 4} ${lEl.y + 8},${lWr.x - 2} ${lWr.y - 6},${lWr.x} ${lWr.y}" 
        fill="none" stroke="${mColor}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>` : ''}

      <!-- Right arm -->
      <path d="M${rSh.x} ${rSh.y} C${rSh.x + 8} ${rSh.y + 12},${rEl.x + 4} ${rEl.y - 8},${rEl.x} ${rEl.y} C${rEl.x + 4} ${rEl.y + 8},${rWr.x + 2} ${rWr.y - 6},${rWr.x} ${rWr.y}" 
        fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      ${activeMuscle ? `
        <path d="M${rSh.x} ${rSh.y} C${rSh.x + 8} ${rSh.y + 12},${rEl.x + 4} ${rEl.y - 8},${rEl.x} ${rEl.y} C${rEl.x + 4} ${rEl.y + 8},${rWr.x + 2} ${rWr.y - 6},${rWr.x} ${rWr.y}" 
        fill="none" stroke="${mColor}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>` : ''}

      <!-- Hands -->
      <ellipse cx="${lWr.x}" cy="${lWr.y}" rx="4" ry="5" fill="${C_SKIN}" stroke="${col}" stroke-width="0.8"/>
      <ellipse cx="${rWr.x}" cy="${rWr.y}" rx="4" ry="5" fill="${C_SKIN}" stroke="${col}" stroke-width="0.8"/>

      <!-- Left leg -->
      <path d="M${lHip.x} ${lHip.y} C${lHip.x - 6} ${lHip.y + 15},${lKn.x - 6} ${lKn.y - 10},${lKn.x} ${lKn.y} C${lKn.x - 5} ${lKn.y + 10},${lAn.x - 3} ${lAn.y - 8},${lAn.x} ${lAn.y}" 
        fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      ${activeMuscle ? `
        <path d="M${lHip.x} ${lHip.y} C${lHip.x - 6} ${lHip.y + 15},${lKn.x - 6} ${lKn.y - 10},${lKn.x} ${lKn.y} C${lKn.x - 5} ${lKn.y + 10},${lAn.x - 3} ${lAn.y - 8},${lAn.x} ${lAn.y}" 
        fill="none" stroke="${mColor}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>` : ''}

      <!-- Right leg -->
      <path d="M${rHip.x} ${rHip.y} C${rHip.x + 6} ${rHip.y + 15},${rKn.x + 6} ${rKn.y - 10},${rKn.x} ${rKn.y} C${rKn.x + 5} ${rKn.y + 10},${rAn.x + 3} ${rAn.y - 8},${rAn.x} ${rAn.y}" 
        fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      ${activeMuscle ? `
        <path d="M${rHip.x} ${rHip.y} C${rHip.x + 6} ${rHip.y + 15},${rKn.x + 6} ${rKn.y - 10},${rKn.x} ${rKn.y} C${rKn.x + 5} ${rKn.y + 10},${rAn.x + 3} ${rAn.y - 8},${rAn.x} ${rAn.y}" 
        fill="none" stroke="${mColor}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"/>` : ''}

      <!-- Feet -->
      <ellipse cx="${lAn.x}" cy="${lAn.y + 3}" rx="7" ry="3" fill="${C_SKIN}" stroke="${col}" stroke-width="0.8"/>
      <ellipse cx="${rAn.x}" cy="${rAn.y + 3}" rx="7" ry="3" fill="${C_SKIN}" stroke="${col}" stroke-width="0.8"/>

      <!-- Joints -->
      <circle cx="${lSh.x}" cy="${lSh.y}" r="4" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${rSh.x}" cy="${rSh.y}" r="4" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${lEl.x}" cy="${lEl.y}" r="3" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${rEl.x}" cy="${rEl.y}" r="3" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${lHip.x}" cy="${lHip.y}" r="4" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${rHip.x}" cy="${rHip.y}" r="4" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${lKn.x}" cy="${lKn.y}" r="3.5" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${rKn.x}" cy="${rKn.y}" r="3.5" fill="${C_JOINT}" stroke="${col}" stroke-width="1"/>
      <circle cx="${lWr.x}" cy="${lWr.y}" r="2.5" fill="${C_JOINT}" stroke="${col}" stroke-width="0.5"/>
      <circle cx="${rWr.x}" cy="${rWr.y}" r="2.5" fill="${C_JOINT}" stroke="${col}" stroke-width="0.5"/>

      <!-- Equipment -->
      ${equipment ? `<g opacity="${Math.min(o * 1.1, 1)}">${equipment}</g>` : ''}
    </g>
  `;
}

// Full exercise diagram with both phases
function drawExerciseDiagram(
  start: Record<string, { x: number; y: number }>,
  end: Record<string, { x: number; y: number }>,
  equipment: string,
  muscleZone: string,
  arrow: { from: { x: number; y: number }; to: { x: number; y: number } },
  labels: { text: string; x: number; y: number }[]
): string {
  const W = 240;
  const H = 340;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="480" height="680">
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="${C_ARROW}"/>
      </marker>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#bgGrad)" rx="8"/>

    <!-- Subtle grid -->
    <g opacity="0.03">
      ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 24}" x2="${W}" y2="${i * 24}" stroke="#fff" stroke-width="0.5"/>`).join('')}
      ${Array.from({ length: 11 }, (_, i) => `<line x1="${i * 24}" y1="0" x2="${i * 24}" y2="${H}" stroke="#fff" stroke-width="0.5"/>`).join('')}
    </g>

    <!-- Start position label -->
    <text x="20" y="22" fill="${C_LABEL_FADE}" font-size="10" font-weight="600" font-family="system-ui, sans-serif" letter-spacing="0.5">BẮT ĐẦU</text>
    <line x1="16" y1="26" x2="70" y2="26" stroke="${C_LABEL_FADE}" stroke-width="1" stroke-dasharray="3 2"/>

    <!-- End position label -->
    <text x="${W - 16}" y="22" fill="${C_LABEL}" font-size="10" font-weight="600" font-family="system-ui, sans-serif" text-anchor="end" letter-spacing="0.5">KẾT THÚC</text>
    <line x1="${W - 70}" y1="26" x2="${W - 16}" y2="26" stroke="${C_LABEL}" stroke-width="1" stroke-dasharray="3 2"/>

    <!-- Start phase (faded, left) -->
    ${drawAnatomyFigure(75, start, 0.25, muscleZone, equipment)}

    <!-- End phase (solid, center-right) -->
    ${drawAnatomyFigure(165, end, 0.95, muscleZone, equipment)}

    <!-- Movement arrow -->
    <line x1="${arrow.from.x}" y1="${arrow.from.y}" x2="${arrow.to.x}" y2="${arrow.to.y}"
      stroke="${C_ARROW}" stroke-width="2.5" stroke-dasharray="6 3" marker-end="url(#arrowhead)" opacity="0.9"
      filter="url(#glow)"/>
    <circle cx="${arrow.from.x}" cy="${arrow.from.y}" r="3" fill="${C_ARROW}" opacity="0.6"/>

    <!-- Labels -->
    ${labels.map((l, i) => `
      <g>
        <rect x="${l.x - 4}" y="${l.y - 10}" width="${l.text.length * 6.5 + 8}" height="16" rx="3" fill="#0f172a" stroke="#334155" stroke-width="0.5" opacity="0.85"/>
        <text x="${l.x}" y="${l.y}" fill="${i === 0 ? C_LABEL : C_LABEL_FADE}" font-size="9" font-family="system-ui, sans-serif" font-weight="${i === 0 ? '600' : '400'}">${l.text}</text>
      </g>
    `).join('')}

    <!-- Muscle zone badge -->
    <g transform="translate(${W - 16}, ${H - 16})">
      <rect x="-100" y="-14" width="100" height="18" rx="9" fill="rgba(34,211,238,0.1)" stroke="rgba(34,211,238,0.3)" stroke-width="0.5"/>
      <circle cx="-90" cy="-5" r="3" fill="rgba(34,211,238,0.6)"/>
      <text x="-80" y="-1" fill="${C_ARROW}" font-size="8" font-family="system-ui, sans-serif" font-weight="500">${muscleZone}</text>
    </g>

    <!-- Phase separator line -->
    <line x1="120" y1="40" x2="120" y2="${H - 40}" stroke="#334155" stroke-width="0.5" stroke-dasharray="4 4" opacity="0.3"/>
  </svg>`;
}

// =========== EXERCISE DEFINITIONS ===========

type Point = { x: number; y: number };

interface ExerciseDef {
  start: Record<string, Point>;
  end: Record<string, Point>;
  equipment: string;
  muscleZone: string;
  arrow: { from: Point; to: Point };
  labels: { text: string; x: number; y: number }[];
}

function barbellBenchPress(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 55 }, neck: { x: cx, y: 72 },
      lShoulder: { x: cx - 32, y: 78 }, rShoulder: { x: cx + 32, y: 78 },
      lElbow: { x: cx - 28, y: 72 }, rElbow: { x: cx + 28, y: 72 },
      lWrist: { x: cx - 50, y: 98 }, rWrist: { x: cx + 50, y: 98 },
      hip: { x: cx, y: 125 }, lHip: { x: cx - 14, y: 125 }, rHip: { x: cx + 14, y: 125 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 55 }, neck: { x: cx, y: 72 },
      lShoulder: { x: cx - 32, y: 78 }, rShoulder: { x: cx + 32, y: 78 },
      lElbow: { x: cx - 55, y: 85 }, rElbow: { x: cx + 55, y: 85 },
      lWrist: { x: cx - 50, y: 62 }, rWrist: { x: cx + 50, y: 62 },
      hip: { x: cx, y: 125 }, lHip: { x: cx - 14, y: 125 }, rHip: { x: cx + 14, y: 125 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    equipment: `
      <rect x="${cx - 56}" y="80" width="112" height="7" rx="3.5" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <rect x="${cx - 56}" y="75" width="14" height="12" rx="2" fill="#1e293b"/>
      <rect x="${cx + 42}" y="75" width="14" height="12" rx="2" fill="#1e293b"/>
      <rect x="${cx - 70}" y="92" width="140" height="10" rx="2" fill="#0f172a" stroke="#334155" stroke-width="1"/>
      <text x="${cx}" y="100" text-anchor="middle" fill="#475569" font-size="7" font-weight="500">GHẾ BĂNG</text>`,
    muscleZone: 'NGỰC',
    arrow: { from: { x: cx - 40, y: 80 }, to: { x: cx - 48, y: 68 } },
    labels: [
      { text: 'Hạ đòn xuống giữa ngực', x: cx + 55, y: 75 },
      { text: 'Đẩy lên bùng nổ', x: cx + 55, y: 88 },
      { text: 'Khuỷu tay 45°', x: cx - 55, y: 95 },
    ],
  };
}

function barbellSquat(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 48 }, neck: { x: cx, y: 64 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 48, y: 88 }, rElbow: { x: cx + 48, y: 88 },
      lWrist: { x: cx - 45, y: 72 }, rWrist: { x: cx + 45, y: 72 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 52 }, neck: { x: cx, y: 68 },
      lShoulder: { x: cx - 30, y: 78 }, rShoulder: { x: cx + 30, y: 78 },
      lElbow: { x: cx - 52, y: 95 }, rElbow: { x: cx + 52, y: 95 },
      lWrist: { x: cx - 48, y: 78 }, rWrist: { x: cx + 48, y: 78 },
      hip: { x: cx, y: 162 }, lHip: { x: cx - 14, y: 162 }, rHip: { x: cx + 14, y: 162 },
      lKnee: { x: cx - 22, y: 212 }, rKnee: { x: cx + 22, y: 212 },
      lAnkle: { x: cx - 12, y: 238 }, rAnkle: { x: cx + 12, y: 238 },
    },
    equipment: `
      <rect x="${cx - 45}" y="48" width="90" height="8" rx="4" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <rect x="${cx - 34}" y="38" width="10" height="16" rx="2" fill="#1e293b"/>
      <rect x="${cx + 24}" y="38" width="10" height="16" rx="2" fill="#1e293b"/>
      <text x="${cx}" y="34" text-anchor="middle" fill="#475569" font-size="8" font-weight="500">BARBELL</text>`,
    muscleZone: 'ĐÙI TRƯỚC + MÔNG',
    arrow: { from: { x: cx, y: 125 }, to: { x: cx, y: 165 } },
    labels: [
      { text: 'Hạ hông xuống song song', x: cx + 55, y: 150 },
      { text: 'Ngực ưỡn, lưng thẳng', x: cx + 55, y: 163 },
      { text: 'Gối không qua mũi chân', x: cx + 55, y: 195 },
      { text: 'Đẩy qua gót chân', x: cx - 50, y: 210 },
    ],
  };
}

function deadlift(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 72 }, neck: { x: cx, y: 88 },
      lShoulder: { x: cx - 30, y: 98 }, rShoulder: { x: cx + 30, y: 98 },
      lElbow: { x: cx - 45, y: 125 }, rElbow: { x: cx + 45, y: 125 },
      lWrist: { x: cx - 38, y: 152 }, rWrist: { x: cx + 38, y: 152 },
      hip: { x: cx, y: 158 }, lHip: { x: cx - 14, y: 158 }, rHip: { x: cx + 14, y: 158 },
      lKnee: { x: cx - 12, y: 208 }, rKnee: { x: cx + 12, y: 208 },
      lAnkle: { x: cx - 12, y: 252 }, rAnkle: { x: cx + 12, y: 252 },
    },
    end: {
      head: { x: cx, y: 38 }, neck: { x: cx, y: 54 },
      lShoulder: { x: cx - 28, y: 68 }, rShoulder: { x: cx + 28, y: 68 },
      lElbow: { x: cx - 42, y: 98 }, rElbow: { x: cx + 42, y: 98 },
      lWrist: { x: cx - 38, y: 138 }, rWrist: { x: cx + 38, y: 138 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 10, y: 178 }, rKnee: { x: cx + 10, y: 178 },
      lAnkle: { x: cx - 10, y: 228 }, rAnkle: { x: cx + 10, y: 228 },
    },
    equipment: `
      <rect x="${cx - 44}" y="142" width="88" height="7" rx="3.5" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <rect x="${cx - 48}" y="132" width="14" height="14" rx="3" fill="#1e293b"/>`
      + `<rect x="${cx + 34}" y="132" width="14" height="14" rx="3" fill="#1e293b"/>
      <text x="${cx}" y="128" text-anchor="middle" fill="#475569" font-size="8" font-weight="500">BARBELL</text>`,
    muscleZone: 'CƠ DỰNG SỐNG + MÔNG',
    arrow: { from: { x: cx, y: 158 }, to: { x: cx, y: 118 } },
    labels: [
      { text: 'Lưng thẳng tuyệt đối', x: cx + 55, y: 100 },
      { text: 'Đẩy hông về trước', x: cx + 55, y: 118 },
      { text: 'Siết mông ở đỉnh', x: cx + 55, y: 132 },
    ],
  };
}

function pullUp(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 55 }, neck: { x: cx, y: 72 },
      lShoulder: { x: cx - 30, y: 88 }, rShoulder: { x: cx + 30, y: 88 },
      lElbow: { x: cx - 40, y: 72 }, rElbow: { x: cx + 40, y: 72 },
      lWrist: { x: cx - 35, y: 55 }, rWrist: { x: cx + 35, y: 55 },
      hip: { x: cx, y: 145 }, lHip: { x: cx - 12, y: 145 }, rHip: { x: cx + 12, y: 145 },
      lKnee: { x: cx - 10, y: 195 }, rKnee: { x: cx + 10, y: 195 },
      lAnkle: { x: cx - 10, y: 242 }, rAnkle: { x: cx + 10, y: 242 },
    },
    end: {
      head: { x: cx, y: 35 }, neck: { x: cx, y: 52 },
      lShoulder: { x: cx - 28, y: 65 }, rShoulder: { x: cx + 28, y: 65 },
      lElbow: { x: cx - 32, y: 92 }, rElbow: { x: cx + 32, y: 92 },
      lWrist: { x: cx - 28, y: 55 }, rWrist: { x: cx + 28, y: 55 },
      hip: { x: cx, y: 130 }, lHip: { x: cx - 12, y: 130 }, rHip: { x: cx + 12, y: 130 },
      lKnee: { x: cx - 10, y: 185 }, rKnee: { x: cx + 10, y: 185 },
      lAnkle: { x: cx - 10, y: 232 }, rAnkle: { x: cx + 10, y: 232 },
    },
    equipment: `
      <rect x="${cx - 55}" y="42" width="110" height="7" rx="3.5" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <line x1="${cx - 45}" y1="49" x2="${cx - 45}" y2="68" stroke="${C_EQUIP_ACCENT}" stroke-width="3" stroke-linecap="round"/>
      <line x1="${cx + 45}" y1="49" x2="${cx + 45}" y2="68" stroke="${C_EQUIP_ACCENT}" stroke-width="3" stroke-linecap="round"/>
      <text x="${cx}" y="34" text-anchor="middle" fill="#475569" font-size="8" font-weight="500">XÀ ĐƠN</text>`,
    muscleZone: 'XÔ',
    arrow: { from: { x: cx, y: 90 }, to: { x: cx, y: 58 } },
    labels: [
      { text: 'Kéo cằm qua xà', x: cx + 55, y: 48 },
      { text: 'Siết xô ở đỉnh', x: cx + 55, y: 62 },
      { text: 'Không đánh lưng', x: cx - 50, y: 115 },
    ],
  };
}

function overheadPress(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 45 }, neck: { x: cx, y: 62 },
      lShoulder: { x: cx - 28, y: 75 }, rShoulder: { x: cx + 28, y: 75 },
      lElbow: { x: cx - 42, y: 88 }, rElbow: { x: cx + 42, y: 88 },
      lWrist: { x: cx - 48, y: 75 }, rWrist: { x: cx + 48, y: 75 },
      hip: { x: cx, y: 120 }, lHip: { x: cx - 14, y: 120 }, rHip: { x: cx + 14, y: 120 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 38, y: 45 }, rElbow: { x: cx + 38, y: 45 },
      lWrist: { x: cx - 42, y: 25 }, rWrist: { x: cx + 42, y: 25 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    equipment: `
      <rect x="${cx - 48}" y="70" width="96" height="7" rx="3.5" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <rect x="${cx - 50}" y="60" width="14" height="16" rx="3" fill="#1e293b"/>
      <rect x="${cx + 36}" y="60" width="14" height="16" rx="3" fill="#1e293b"/>`,
    muscleZone: 'VAI',
    arrow: { from: { x: cx, y: 70 }, to: { x: cx, y: 38 } },
    labels: [
      { text: 'Đẩy thẳng lên trời', x: cx + 55, y: 40 },
      { text: 'Đầu xuyên qua tay', x: cx + 55, y: 54 },
      { text: 'Siết core', x: cx - 50, y: 100 },
    ],
  };
}

function bicepCurl(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 32, y: 95 }, rElbow: { x: cx + 32, y: 95 },
      lWrist: { x: cx - 32, y: 118 }, rWrist: { x: cx + 32, y: 118 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 32, y: 95 }, rElbow: { x: cx + 32, y: 95 },
      lWrist: { x: cx - 32, y: 72 }, rWrist: { x: cx + 32, y: 72 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    equipment: `
      <rect x="${cx - 38}" y="112" width="14" height="16" rx="3" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <rect x="${cx + 24}" y="112" width="14" height="16" rx="3" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>`,
    muscleZone: 'TAY TRƯỚC',
    arrow: { from: { x: cx - 32, y: 112 }, to: { x: cx - 32, y: 74 } },
    labels: [
      { text: 'Khuỷu tay cố định', x: cx + 55, y: 82 },
      { text: 'Siết đỉnh 1 giây', x: cx + 55, y: 96 },
      { text: 'Không vung thân', x: cx - 50, y: 105 },
    ],
  };
}

function tricepPushdown(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 35, y: 95 }, rElbow: { x: cx + 35, y: 95 },
      lWrist: { x: cx - 38, y: 78 }, rWrist: { x: cx + 38, y: 78 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 32, y: 95 }, rElbow: { x: cx + 32, y: 95 },
      lWrist: { x: cx - 28, y: 118 }, rWrist: { x: cx + 28, y: 118 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    equipment: `
      <line x1="${cx}" y1="15" x2="${cx}" y2="70" stroke="${C_EQUIP_ACCENT}" stroke-width="3" stroke-linecap="round"/>
      <rect x="${cx - 45}" y="72" width="90" height="6" rx="2" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <line x1="${cx - 30}" y1="78" x2="${cx - 30}" y2="86" stroke="${C_EQUIP}" stroke-width="2" stroke-linecap="round"/>
      <line x1="${cx + 30}" y1="78" x2="${cx + 30}" y2="86" stroke="${C_EQUIP}" stroke-width="2" stroke-linecap="round"/>
      <text x="${cx}" y="92" text-anchor="middle" fill="#475569" font-size="7" font-weight="500">CABLE</text>`,
    muscleZone: 'TAY SAU',
    arrow: { from: { x: cx - 32, y: 78 }, to: { x: cx - 28, y: 112 } },
    labels: [
      { text: 'Đẩy thẳng xuống', x: cx + 55, y: 92 },
      { text: 'Khuỷu sát thân', x: cx + 55, y: 106 },
    ],
  };
}

function lateralRaise(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 22, y: 100 }, rElbow: { x: cx + 22, y: 100 },
      lWrist: { x: cx - 22, y: 122 }, rWrist: { x: cx + 22, y: 122 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 16, y: 55 }, rElbow: { x: cx + 16, y: 55 },
      lWrist: { x: cx - 14, y: 58 }, rWrist: { x: cx + 14, y: 58 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    equipment: `
      <rect x="${cx - 30}" y="114" width="12" height="14" rx="3" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <rect x="${cx + 18}" y="114" width="12" height="14" rx="3" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>`,
    muscleZone: 'VAI GIỮA',
    arrow: { from: { x: cx - 20, y: 108 }, to: { x: cx - 14, y: 60 } },
    labels: [
      { text: 'Nâng ngang vai', x: cx + 55, y: 58 },
      { text: 'Khuỷu hơi gập', x: cx + 55, y: 72 },
      { text: 'Dừng ở đỉnh', x: cx - 50, y: 58 },
    ],
  };
}

function plank(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 62 }, neck: { x: cx, y: 78 },
      lShoulder: { x: cx - 30, y: 95 }, rShoulder: { x: cx + 30, y: 95 },
      lElbow: { x: cx - 28, y: 122 }, rElbow: { x: cx + 28, y: 122 },
      lWrist: { x: cx - 28, y: 128 }, rWrist: { x: cx + 28, y: 128 },
      hip: { x: cx, y: 128 }, lHip: { x: cx - 14, y: 128 }, rHip: { x: cx + 14, y: 128 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 62 }, neck: { x: cx, y: 78 },
      lShoulder: { x: cx - 30, y: 95 }, rShoulder: { x: cx + 30, y: 95 },
      lElbow: { x: cx - 28, y: 122 }, rElbow: { x: cx + 28, y: 122 },
      lWrist: { x: cx - 28, y: 128 }, rWrist: { x: cx + 28, y: 128 },
      hip: { x: cx, y: 128 }, lHip: { x: cx - 14, y: 128 }, rHip: { x: cx + 14, y: 128 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    equipment: `
      <rect x="${cx - 55}" y="92" width="110" height="5" rx="2" fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="4 3"/>
      <text x="${cx}" y="88" text-anchor="middle" fill="#475569" font-size="8" font-weight="500">SÀN</text>`,
    muscleZone: 'BỤNG',
    arrow: { from: { x: cx - 40, y: 145 }, to: { x: cx - 40, y: 132 } },
    labels: [
      { text: 'Giữ thân thẳng', x: cx + 55, y: 115 },
      { text: 'Siết bụng + mông', x: cx + 55, y: 130 },
      { text: 'Không xệ hông!', x: cx - 50, y: 155 },
    ],
  };
}

function lunge(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 42 }, neck: { x: cx, y: 58 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 22, y: 98 }, rElbow: { x: cx + 22, y: 98 },
      lWrist: { x: cx - 22, y: 118 }, rWrist: { x: cx + 22, y: 118 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 48 }, neck: { x: cx, y: 64 },
      lShoulder: { x: cx - 28, y: 78 }, rShoulder: { x: cx + 28, y: 78 },
      lElbow: { x: cx - 22, y: 102 }, rElbow: { x: cx + 22, y: 102 },
      lWrist: { x: cx - 22, y: 122 }, rWrist: { x: cx + 22, y: 122 },
      hip: { x: cx, y: 148 }, lHip: { x: cx - 12, y: 148 }, rHip: { x: cx + 12, y: 148 },
      lKnee: { x: cx + 25, y: 152 }, rKnee: { x: cx - 18, y: 202 },
      lAnkle: { x: cx + 32, y: 190 }, rAnkle: { x: cx - 22, y: 238 },
    },
    equipment: `
      <rect x="${cx - 28}" y="112" width="12" height="14" rx="3" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <rect x="${cx + 16}" y="112" width="12" height="14" rx="3" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>`,
    muscleZone: 'ĐÙI TRƯỚC',
    arrow: { from: { x: cx, y: 125 }, to: { x: cx, y: 155 } },
    labels: [
      { text: 'Bước dài về trước', x: cx + 55, y: 138 },
      { text: 'Gối trước 90°', x: cx + 55, y: 152 },
      { text: 'Đùi trước // sàn', x: cx - 50, y: 165 },
    ],
  };
}

function seatedCableRow(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 55 }, neck: { x: cx, y: 72 },
      lShoulder: { x: cx - 32, y: 82 }, rShoulder: { x: cx + 32, y: 82 },
      lElbow: { x: cx - 42, y: 105 }, rElbow: { x: cx + 42, y: 105 },
      lWrist: { x: cx - 52, y: 118 }, rWrist: { x: cx + 52, y: 118 },
      hip: { x: cx, y: 128 }, lHip: { x: cx - 14, y: 128 }, rHip: { x: cx + 14, y: 128 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    end: {
      head: { x: cx, y: 55 }, neck: { x: cx, y: 72 },
      lShoulder: { x: cx - 32, y: 78 }, rShoulder: { x: cx + 32, y: 78 },
      lElbow: { x: cx - 32, y: 92 }, rElbow: { x: cx + 32, y: 92 },
      lWrist: { x: cx - 28, y: 95 }, rWrist: { x: cx + 28, y: 95 },
      hip: { x: cx, y: 128 }, lHip: { x: cx - 14, y: 128 }, rHip: { x: cx + 14, y: 128 },
      lKnee: { x: cx - 12, y: 178 }, rKnee: { x: cx + 12, y: 178 },
      lAnkle: { x: cx - 12, y: 222 }, rAnkle: { x: cx + 12, y: 222 },
    },
    equipment: `
      <rect x="${cx - 60}" y="92" width="24" height="8" rx="2" fill="${C_EQUIP}" stroke="${C_EQUIP_ACCENT}" stroke-width="1"/>
      <line x1="${cx - 62}" y1="96" x2="${cx - 58}" y2="96" stroke="${C_EQUIP_ACCENT}" stroke-width="2"/>
      <text x="${cx - 48}" y="88" text-anchor="middle" fill="#475569" font-size="7" font-weight="500">CABLE</text>`,
    muscleZone: 'LƯNG GIỮA',
    arrow: { from: { x: cx - 48, y: 112 }, to: { x: cx - 28, y: 92 } },
    labels: [
      { text: 'Kéo về bụng', x: cx + 55, y: 90 },
      { text: 'Siết bả vai', x: cx + 55, y: 104 },
      { text: 'Lưng thẳng', x: cx - 50, y: 115 },
    ],
  };
}

function cardio(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 45 }, neck: { x: cx, y: 62 },
      lShoulder: { x: cx - 28, y: 78 }, rShoulder: { x: cx + 28, y: 78 },
      lElbow: { x: cx - 42, y: 98 }, rElbow: { x: cx + 42, y: 98 },
      lWrist: { x: cx - 38, y: 118 }, rWrist: { x: cx + 38, y: 118 },
      hip: { x: cx, y: 125 }, lHip: { x: cx - 14, y: 125 }, rHip: { x: cx + 14, y: 125 },
      lKnee: { x: cx - 15, y: 172 }, rKnee: { x: cx + 15, y: 172 },
      lAnkle: { x: cx - 18, y: 212 }, rAnkle: { x: cx + 18, y: 212 },
    },
    end: {
      head: { x: cx, y: 38 }, neck: { x: cx, y: 55 },
      lShoulder: { x: cx - 28, y: 72 }, rShoulder: { x: cx + 28, y: 72 },
      lElbow: { x: cx - 38, y: 88 }, rElbow: { x: cx + 38, y: 88 },
      lWrist: { x: cx - 34, y: 105 }, rWrist: { x: cx + 34, y: 105 },
      hip: { x: cx, y: 118 }, lHip: { x: cx - 14, y: 118 }, rHip: { x: cx + 14, y: 118 },
      lKnee: { x: cx - 22, y: 155 }, rKnee: { x: cx + 22, y: 155 },
      lAnkle: { x: cx - 26, y: 188 }, rAnkle: { x: cx + 26, y: 188 },
    },
    equipment: '',
    muscleZone: 'TIM MẠCH',
    arrow: { from: { x: cx, y: 135 }, to: { x: cx, y: 122 } },
    labels: [
      { text: 'Nhịp tim tăng', x: cx + 55, y: 92 },
      { text: 'Thở đều, giữ pace', x: cx + 55, y: 106 },
    ],
  };
}

function mobility(): ExerciseDef {
  const cx = 110;
  return {
    start: {
      head: { x: cx, y: 65 }, neck: { x: cx, y: 82 },
      lShoulder: { x: cx - 28, y: 98 }, rShoulder: { x: cx + 28, y: 98 },
      lElbow: { x: cx - 38, y: 122 }, rElbow: { x: cx + 38, y: 122 },
      lWrist: { x: cx - 38, y: 138 }, rWrist: { x: cx + 38, y: 138 },
      hip: { x: cx, y: 155 }, lHip: { x: cx - 14, y: 155 }, rHip: { x: cx + 14, y: 155 },
      lKnee: { x: cx - 12, y: 205 }, rKnee: { x: cx + 12, y: 205 },
      lAnkle: { x: cx - 12, y: 248 }, rAnkle: { x: cx + 12, y: 248 },
    },
    end: {
      head: { x: cx, y: 58 }, neck: { x: cx, y: 75 },
      lShoulder: { x: cx - 28, y: 92 }, rShoulder: { x: cx + 28, y: 92 },
      lElbow: { x: cx - 38, y: 115 }, rElbow: { x: cx + 38, y: 115 },
      lWrist: { x: cx - 38, y: 132 }, rWrist: { x: cx + 38, y: 132 },
      hip: { x: cx, y: 162 }, lHip: { x: cx - 14, y: 162 }, rHip: { x: cx + 14, y: 162 },
      lKnee: { x: cx - 18, y: 208 }, rKnee: { x: cx + 18, y: 208 },
      lAnkle: { x: cx - 18, y: 252 }, rAnkle: { x: cx + 18, y: 252 },
    },
    equipment: '',
    muscleZone: 'LINH HOẠT',
    arrow: { from: { x: cx, y: 105 }, to: { x: cx, y: 115 } },
    labels: [
      { text: 'Di chuyển chậm', x: cx + 55, y: 105 },
      { text: 'Phối hợp hơi thở', x: cx + 55, y: 120 },
      { text: 'Giữ 15-30 giây', x: cx - 50, y: 135 },
    ],
  };
}

// Map exercise name to generator
function getExerciseDef(name: string): ExerciseDef {
  if (name.includes('Đẩy Ngực') && !name.includes('Tay Hẹp') && !name.includes('Dốc Xuống')) return barbellBenchPress();
  if (name.includes('Dốc Xuống') || name.includes('Máy Đẩy Ngực')) return barbellBenchPress();
  if (name.includes('Hít Đất') && !name.includes('Kim Cương')) return {
    ...barbellBenchPress(), labels: [
      { text: 'Hạ ngực sát đất', x: 165, y: 75 },
      { text: 'Đẩy lên bùng nổ', x: 165, y: 90 },
      { text: 'Siết core!', x: 55, y: 95 },
    ],
  };
  if (name.includes('Squat') && !name.includes('Front') && !name.includes('Bulgarian') && !name.includes('Split')) return barbellSquat();
  if (name.includes('Front Squat')) return barbellSquat();
  if (name.includes('Leg Press')) return {
    ...barbellSquat(), equipment: `<text x="110" y="30" text-anchor="middle" fill="#475569" font-size="8" font-weight="500">MÁY LEG PRESS</text>`,
    labels: [
      { text: 'Hạ đến gối 90°', x: 165, y: 175 },
      { text: 'Không khóa gối', x: 165, y: 190 },
    ],
  };
  if (name.includes('Deadlift') && !name.includes('RDL')) return deadlift();
  if (name.includes('RDL') || name.includes('Romanian Deadlift')) return deadlift();
  if (name.includes('Xà Đơn') || name.includes('Hít Xà')) return pullUp();
  if (name.includes('Kéo Xô')) return pullUp();
  if (name.includes('Đẩy Vai') && name.includes('Barbell')) return overheadPress();
  if (name.includes('Đẩy Vai') && name.includes('Dumbbell')) return overheadPress();
  if (name.includes('Cuốn Tạ') || name.includes('Curl') || name.includes('Preacher') || name.includes('Concentration')) return bicepCurl();
  if (name.includes('Hammer Curl')) return bicepCurl();
  if (name.includes('Tay Sau') || name.includes('Skull') || name.includes('Kim Cương') || name.includes('Tay Hẹp')) return tricepPushdown();
  if (name.includes('Nâng Vai Giữa') || name.includes('Lateral')) return lateralRaise();
  if (name.includes('Nâng Vai Trước') || name.includes('Front Raise')) return lateralRaise();
  if (name.includes('Ép Vai Sau') || name.includes('Rear Delt')) return lateralRaise();
  if (name.includes('Chèo') || name.includes('Row')) return seatedCableRow();
  if (name.includes('Face Pull') || name.includes('Kéo Mặt')) return seatedCableRow();
  if (name.includes('Lunge') || name.includes('Split Squat') || name.includes('Bulgarian')) return lunge();
  if (name.includes('Plank')) return plank();
  if (name.includes('Bụng') || name.includes('Crunch') || name.includes('Ab Wheel') || name.includes('Nâng Chân')) return plank();
  if (name.includes('Russian Tw')) return plank();
  if (name.includes('Hip Thrust') || name.includes('Mông') || name.includes('Đạp Mông') || name.includes('Dạng Hông')) return lunge();
  if (name.includes('Leg Extension') || name.includes('Leg Curl') || name.includes('Bắp Chân')) return lunge();
  if (name.includes('Cardio') || name.includes('Nhảy Dây') || name.includes('Chèo') || name.includes('Đi Bộ') || name.includes('Tim Mạch')) return cardio();
  if (name.includes('Giãn') || name.includes('Stretch') || name.includes('Mèo') || name.includes('Linh Hoạt')) return mobility();
  if (name.includes('Ép Ngực')) return barbellBenchPress();
  return barbellBenchPress();
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get('name') || '';

  const imgUrl = getExerciseImage(name);
  if (imgUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(imgUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const ct = response.headers.get('content-type') || 'image/jpeg';
        return new Response(arrayBuffer, { status: 200, headers: { 'Content-Type': ct, 'Content-Length': String(arrayBuffer.byteLength), 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' } });
      }
    } catch (e) { console.error('[exercise-img] Fetch failed', name, e instanceof Error ? e.message : e); }
  }

  const def = getExerciseDef(name);
  const svg = drawExerciseDiagram(def.start, def.end, def.equipment, def.muscleZone, def.arrow, def.labels);
  return new NextResponse(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Content-Length': String(Buffer.byteLength(svg)), 'Cache-Control': 'public, max-age=3600' } });
}

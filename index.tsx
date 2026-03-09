
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// --- CHART COLORS & DEFAULTS ---
const CHART_COLORS = [
    '#78BD42', // Primary Green
    '#2D3748', // Dark Gray (Text)
    '#F97316', // Orange (Accent)
    '#A0AEC0', // Light Gray (Neutral)
    '#4ade80', // Light Green
    '#fb923c'  // Light Orange
];

// Global Chart.js Defaults for "Impeccable" Look
if ((window as any).Chart) {
    (window as any).Chart.defaults.font.family = "'Inter', sans-serif";
    (window as any).Chart.defaults.color = '#64748B'; // Slate 500 for better readability
    (window as any).Chart.defaults.font.size = 14; // Increased for better readability on zoom
    (window as any).Chart.defaults.font.weight = '500';
    
    // ANIMATIONS: Fluid transitions configuration
    (window as any).Chart.defaults.animation.duration = 1000; // 1 second for smooth movement
    (window as any).Chart.defaults.animation.easing = 'easeOutQuart'; // Very smooth deceleration
    (window as any).Chart.defaults.transitions.active.animation.duration = 400; // Hover effects are faster
    
    // Tooltips mais modernos
    (window as any).Chart.defaults.plugins.tooltip.backgroundColor = '#1E293B';
    (window as any).Chart.defaults.plugins.tooltip.padding = 16;
    (window as any).Chart.defaults.plugins.tooltip.cornerRadius = 12;
    (window as any).Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: '700' };
    (window as any).Chart.defaults.plugins.tooltip.bodyFont = { size: 13 };
    (window as any).Chart.defaults.plugins.tooltip.displayColors = false; // Remove o quadradinho de cor do tooltip

    // DataLabels Defaults (Números direto no gráfico)
    if ((window as any).ChartDataLabels) {
        (window as any).Chart.register((window as any).ChartDataLabels);
        (window as any).Chart.defaults.plugins.datalabels.color = '#1E293B';
        (window as any).Chart.defaults.plugins.datalabels.font = { weight: '700', size: 12 };
        (window as any).Chart.defaults.plugins.datalabels.display = 'auto';
        (window as any).Chart.defaults.plugins.datalabels.anchor = 'end';
        (window as any).Chart.defaults.plugins.datalabels.align = 'end';
        (window as any).Chart.defaults.plugins.datalabels.offset = 4;
    }
}


const root = createRoot(document.getElementById('root')!);
root.render(<App />);


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

// Global Chart.js Defaults - Modern Premium Look
if ((window as any).Chart) {
    const C = (window as any).Chart;

    // Typography
    C.defaults.font.family = "'Inter', sans-serif";
    C.defaults.font.size = 12;
    C.defaults.font.weight = '500';
    C.defaults.color = '#64748B';

    // Animations - smooth but not slow
    C.defaults.animation.duration = 600;
    C.defaults.animation.easing = 'easeOutQuart';
    C.defaults.transitions.active.animation.duration = 200;

    // Bar charts - rounded corners, proper spacing
    C.defaults.datasets.bar.borderRadius = 6;
    C.defaults.datasets.bar.borderSkipped = false;
    C.defaults.datasets.bar.maxBarThickness = 44;
    C.defaults.datasets.bar.categoryPercentage = 0.75;
    C.defaults.datasets.bar.barPercentage = 0.8;

    // Arc elements (doughnut/pie) - white gaps between slices
    C.defaults.elements.arc.borderWidth = 2;
    C.defaults.elements.arc.borderColor = '#ffffff';

    // Point elements (radar/line)
    C.defaults.elements.point.radius = 4;
    C.defaults.elements.point.hoverRadius = 6;
    C.defaults.elements.point.borderWidth = 2;

    // Layout padding
    C.defaults.layout.padding = { top: 8, right: 8, bottom: 4, left: 8 };

    // Tooltips - dark, modern, compact
    C.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    C.defaults.plugins.tooltip.titleColor = '#f8fafc';
    C.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
    C.defaults.plugins.tooltip.borderColor = 'rgba(148, 163, 184, 0.15)';
    C.defaults.plugins.tooltip.borderWidth = 1;
    C.defaults.plugins.tooltip.padding = 12;
    C.defaults.plugins.tooltip.cornerRadius = 10;
    C.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600', family: "'Inter', sans-serif" };
    C.defaults.plugins.tooltip.bodyFont = { size: 11, family: "'Inter', sans-serif" };
    C.defaults.plugins.tooltip.displayColors = true;
    C.defaults.plugins.tooltip.boxPadding = 4;
    C.defaults.plugins.tooltip.usePointStyle = true;
    C.defaults.plugins.tooltip.caretSize = 5;

    // Legend - minimal, point style
    C.defaults.plugins.legend.labels.usePointStyle = true;
    C.defaults.plugins.legend.labels.pointStyle = 'circle';
    C.defaults.plugins.legend.labels.padding = 16;
    C.defaults.plugins.legend.labels.font = { size: 11, family: "'Inter', sans-serif", weight: '500' };

    // DataLabels
    if ((window as any).ChartDataLabels) {
        C.register((window as any).ChartDataLabels);
        C.defaults.plugins.datalabels.color = '#475569';
        C.defaults.plugins.datalabels.font = { weight: '700', size: 11 };
        C.defaults.plugins.datalabels.display = 'auto';
        C.defaults.plugins.datalabels.anchor = 'end';
        C.defaults.plugins.datalabels.align = 'end';
        C.defaults.plugins.datalabels.offset = 2;
    }
}


const root = createRoot(document.getElementById('root')!);
root.render(<App />);

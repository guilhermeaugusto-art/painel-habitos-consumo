
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { GoogleGenAI } from "@google/genai";

import { supabase } from "./config/supabase";
import { AppStyles } from "./config/styles";
import { AiMessage, RicardoAssistantHandle, SortConfig, DashboardData } from "./types";

// -----------------------------------------------------------------------------
// CONSTANTES E HELPERS GERAIS
// -----------------------------------------------------------------------------

const stateToRegion: Record<string, string> = {
  Acre: "Norte",
  Alagoas: "Nordeste",
  Amapá: "Norte",
  Amazonas: "Norte",
  Bahia: "Nordeste",
  Ceará: "Nordeste",
  "Distrito Federal": "Centro-Oeste",
  "Espírito Santo": "Sudeste",
  Goiás: "Centro-Oeste",
  Maranhão: "Nordeste",
  "Mato Grosso": "Centro-Oeste",
  "Mato Grosso do Sul": "Centro-Oeste",
  "Minas Gerais": "Sudeste",
  Pará: "Norte",
  Paraíba: "Nordeste",
  Paraná: "Sul",
  Pernambuco: "Nordeste",
  Piauí: "Nordeste",
  "Rio de Janeiro": "Sudeste",
  "Rio Grande do Norte": "Nordeste",
  "Rio Grande do Sul": "Sul",
  Rondônia: "Norte",
  Roraima: "Norte",
  "Santa Catarina": "Sul",
  "São Paulo": "Sudeste",
  Sergipe: "Nordeste",
  Tocantins: "Norte",
};

const smartSplitter = /[;,](?![^()]*\))/g;

const getUniqueValues = (data: any[], field: string, splitter = smartSplitter): string[] => {
  const values = new Set<string>();
  data.forEach((row) => {
    if (row[field]) {
      String(row[field])
        .split(splitter)
        .map((s) => s.trim())
        .forEach((item) => {
          if (item) values.add(item);
        });
    }
  });
  return Array.from(values);
};

const countOccurrences = (data: any[], field: string, splitter = smartSplitter) => {
  const counts: Record<string, number> = {};
  data.forEach((row) => {
    if (row[field]) {
      const uniqueItems = new Set<string>();
      String(row[field])
        .split(splitter)
        .map((s) => s.trim())
        .forEach((item) => {
          if (item) uniqueItems.add(item);
        });

      uniqueItems.forEach((item) => {
        counts[item] = (counts[item] || 0) + 1;
      });
    }
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
};

const countOccurrencesWithGrouping = (
  data: any[],
  field: string,
  groupingMap: Record<string, string>,
  splitter = smartSplitter
) => {
  const counts: Record<string, number> = {};
  data.forEach((row) => {
    if (row[field]) {
      const uniqueKeys = new Set<string>();
      String(row[field])
        .split(splitter)
        .map((s) => s.trim())
        .forEach((item) => {
          if (item) {
            const key = groupingMap[item] || item;
            uniqueKeys.add(key);
          }
        });

      uniqueKeys.forEach((key) => {
        counts[key] = (counts[key] || 0) + 1;
      });
    }
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));
};

const groupByField = (data: any[], field: string) => {
  const grouped = data.reduce<Record<string, number>>((acc, row) => {
    const key = row[field] || "N/A";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

const simplifyLabel = (label: string) => label || "";

const formatNumber = (num: number) =>
  new Intl.NumberFormat("pt-BR").format(num);

// -----------------------------------------------------------------------------
// CHART COLORS & DEFAULTS
// -----------------------------------------------------------------------------
const CHART_COLORS = [
    '#78BD42', // Primary Green
    '#2D3748', // Dark Gray (Text)
    '#F97316', // Orange (Accent)
    '#A0AEC0', // Light Gray (Neutral)
    '#4ade80', // Light Green
    '#fb923c'  // Light Orange
];

// Global Chart.js Defaults
if ((window as any).Chart) {
    (window as any).Chart.defaults.font.family = "'Inter', sans-serif";
    (window as any).Chart.defaults.color = '#64748B'; 
    (window as any).Chart.defaults.font.size = 14; 
    (window as any).Chart.defaults.font.weight = '500';
    
    // VISIBILITY: Increase Bar Thickness globally
    (window as any).Chart.defaults.datasets.bar.barPercentage = 0.9;
    (window as any).Chart.defaults.datasets.bar.categoryPercentage = 0.9;
    
    // ANIMATIONS: DISABLE INITIAL ANIMATIONS for static feel on updates
    (window as any).Chart.defaults.animation.duration = 0; 
    (window as any).Chart.defaults.transitions.active.animation.duration = 0;
    (window as any).Chart.defaults.transitions.resize.animation.duration = 0;
    
    // Slight hover effect only
    (window as any).Chart.defaults.hover.animationDuration = 150;

    // Tooltips
    (window as any).Chart.defaults.plugins.tooltip.backgroundColor = '#1E293B';
    (window as any).Chart.defaults.plugins.tooltip.padding = 16;
    (window as any).Chart.defaults.plugins.tooltip.cornerRadius = 12;
    (window as any).Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: '700' };
    (window as any).Chart.defaults.plugins.tooltip.bodyFont = { size: 13 };
    (window as any).Chart.defaults.plugins.tooltip.displayColors = false; 

    // DataLabels
    if ((window as any).ChartDataLabels) {
        (window as any).Chart.register((window as any).ChartDataLabels);
        (window as any).Chart.defaults.plugins.datalabels.color = '#1E293B';
        // Increase font weight/size for better visibility
        (window as any).Chart.defaults.plugins.datalabels.font = { weight: '800', size: 13 };
        (window as any).Chart.defaults.plugins.datalabels.display = 'auto';
        (window as any).Chart.defaults.plugins.datalabels.anchor = 'end';
        (window as any).Chart.defaults.plugins.datalabels.align = 'end';
        (window as any).Chart.defaults.plugins.datalabels.offset = 4;
    }
}

// -----------------------------------------------------------------------------
// RECOMENDAÇÕES POR CONTEXTO / LINKS ATUALIZADOS
// -----------------------------------------------------------------------------

const getContextualRecommendation = (region: string, chartKey: string) => {
  const isNorth = region === "Norte" || region === "Nordeste";

  const recommendations: Record<
    string,
    { title: string; url: string; actionPhrase: string }
  > = {
    pagariamApp: {
      title: "CRM WhatsApp",
      url: "https://www.clubpetro.com/crm-whatsapp",
      actionPhrase: "criar um canal de vendas direto e próprio",
    },
    paymentMethods: {
      title: "FideliCash",
      url: "https://www.clubpetro.com/fidelicash",
      actionPhrase: "automatizar o cashback no pagamento",
    },
    convenienceUsage: {
      title: "ClubPetro Essencial",
      url: "https://www.clubpetro.com/clubpetro-essencial",
      actionPhrase: "comunicar ofertas diretamente no celular",
    },
    fidelityDistribution: {
      title: "Análise 360",
      url: "https://www.clubpetro.com/analise-360",
      actionPhrase: "entender profundamente o comportamento de compra",
    },
    benefitPreferences: {
      title: "ClubPetro Essencial",
      url: "https://www.clubpetro.com/clubpetro-essencial",
      actionPhrase: "oferecer recompensas que realmente engajam",
    },
    topFactors: {
      title: "Gestão de Metas",
      url: "https://www.clubpetro.com/gestao-de-metas",
      actionPhrase: "alinhar o atendimento e as metas do time",
    },
    topServices: isNorth
      ? {
          title: "Indique e Ganhe",
          url: "https://www.clubpetro.com/indique-e-ganhe",
          actionPhrase: "transformar clientes em promotores da marca",
        }
      : {
          title: "ClubPetro Essencial",
          url: "https://www.clubpetro.com/clubpetro-essencial",
          actionPhrase: "divulgar seus diferenciais",
        },
    topPlacesOnTheWay: {
      title: "Materiais Gratuitos",
      url: "https://www.clubpetro.com/materiais",
      actionPhrase: "criar parcerias locais estratégicas",
    },
    freqGastoHeatmap: {
      title: "Análise 360",
      url: "https://www.clubpetro.com/analise-360",
      actionPhrase: "segmentar perfis de alto valor",
    },
    freqGastoBar: {
      title: "Análise 360",
      url: "https://www.clubpetro.com/analise-360",
      actionPhrase: "estratégias de vendas personalizadas",
    },
  };

  return (
    recommendations[chartKey] || {
      title: "Fale com Especialista",
      url: "https://www.clubpetro.com/fale-com-os-especialistas",
      actionPhrase: "falar com um especialista",
    }
  );
};

// -----------------------------------------------------------------------------
// HOOK PRINCIPAL DE PROCESSAMENTO DOS DADOS
// -----------------------------------------------------------------------------

const useDashboardData = (
  rawData: any[] | null,
  filters: { region: string }
): DashboardData | null =>
  useMemo(() => {
    if (!rawData) return null;

    const filteredData =
      filters.region && filters.region !== "Todos"
        ? rawData.filter((row) => stateToRegion[row.estado] === filters.region)
        : rawData;

    const totalRespostas = filteredData.length;

    const emptyState: DashboardData = {
      kpis: {
        totalRespostas: 0,
        percPagariamApp: 0,
        avgBrandImportance: "N/A",
        dominantGasto: "N/A",
        dominantFidelidade: "N/A",
      },
      distribution: { byRegionState: [] },
      consumption: { freqGasto: {} },
      digital: { paymentMethods: [] },
      drivers: { topFactors: [] },
      journey: { topServices: [], topPlacesOnTheWay: [] },
      behavior: {
        convenienceUsage: [],
        benefitPreferences: [],
        fidelityDistribution: [],
      },
      detailedStateAnalysis: [],
    };

    if (totalRespostas === 0) return emptyState;

    let pagariamAppCount = 0;
    let brandScoreSum = 0;
    let brandScoreCount = 0;

    filteredData.forEach((r) => {
      if (r.pagaria_app_desconto === "Sim") pagariamAppCount++;
      if (r.importancia_marca != null) {
        const score = parseFloat(String(r.importancia_marca).replace(",", "."));
        if (!isNaN(score)) {
          brandScoreSum += score;
          brandScoreCount++;
        }
      }
    });

    const percPagariamApp = Math.round(
      (pagariamAppCount / totalRespostas) * 100
    );
    const avgBrandImportance =
      brandScoreCount > 0 ? (brandScoreSum / brandScoreCount).toFixed(1) : "N/A";

    const dominantGastoData = groupByField(filteredData, "gasto_medio");
    const dominantGasto =
      dominantGastoData.length > 0 ? dominantGastoData[0].label : "N/A";

    const dominantFidelidadeData = groupByField(filteredData, "nivel_fidelidade");
    const dominantFidelidade =
      dominantFidelidadeData.length > 0
        ? dominantFidelidadeData[0].label
        : "N/A";

    const distByRegion = groupByField(filteredData, "estado").map((d) => ({
      ...d,
      region: stateToRegion[d.label],
    }));

    const paymentFactorsMap = {
      Pix: "Flexibilidade de Pagamento",
      "Cartão de Crédito": "Flexibilidade de Pagamento",
      "Cartão de Débito": "Flexibilidade de Pagamento",
      "Formas de pagamento (Pix, crédito, etc.)": "Flexibilidade de Pagamento",
      "Facilidade de pagamento (Pix, crédito, etc.)": "Flexibilidade de Pagamento",
      "Opções de Pagamento": "Flexibilidade de Pagamento",
      "Pagamento por Aproximação": "Flexibilidade de Pagamento",
      "Pagamento por App": "Flexibilidade de Pagamento",
      "Variedade de formas de pagamento": "Flexibilidade de Pagamento",
    };

    const paymentServicesMap = {
      "Pagamento via Pix": "Serviços de Pagamento Digital",
      "Pagamento por aplicativo": "Serviços de Pagamento Digital",
      "Totem de autopagamento": "Serviços de Pagamento Digital",
    };

    const topFactors = countOccurrencesWithGrouping(
      filteredData,
      "principais_fatores",
      paymentFactorsMap
    ).slice(0, 5);

    const topServices = countOccurrencesWithGrouping(
      filteredData,
      "servicos_interessantes",
      paymentServicesMap
    ).slice(0, 5);

    const topPlacesOnTheWay = countOccurrences(
      filteredData,
      "locais_no_caminho"
    ).slice(0, 5);

    const getDominantValue = (arr: string[]) => {
      if (!arr || arr.length === 0) return "N/A";
      const counts = arr.reduce(
        (acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      return Object.keys(counts).reduce(
        (a, b) => (counts[a] > counts[b] ? a : b),
        Object.keys(counts)[0] || "N/A"
      );
    };

    type StateGroup = {
      gasto_medio: string[];
      frequencia_abastecimento: string[];
      responses: number;
      region: string;
    };

    const stateGroups = filteredData.reduce<Record<string, StateGroup>>(
      (acc, row) => {
        const state = row.estado || "N/A";
        if (!acc[state]) {
          acc[state] = {
            gasto_medio: [],
            frequencia_abastecimento: [],
            responses: 0,
            region: stateToRegion[state] || "N/A",
          };
        }
        if (row.gasto_medio) acc[state].gasto_medio.push(row.gasto_medio);
        if (row.frequencia_abastecimento)
          acc[state].frequencia_abastecimento.push(row.frequencia_abastecimento);
        acc[state].responses++;
        return acc;
      },
      {}
    );

    const detailedStateAnalysis = Object.entries(stateGroups)
      .map(([state, data]) => ({
        state,
        region: data.region,
        responses: data.responses,
        dominantGasto: getDominantValue(data.gasto_medio),
        dominantFreq: getDominantValue(data.frequencia_abastecimento),
      }))
      .sort((a, b) => b.responses - a.responses);

    const freqGasto = filteredData.reduce(
      (acc, row) => {
        const freq = row.frequencia_abastecimento || "N/A";
        const gasto = row.gasto_medio || "N/A";
        if (!acc[freq]) acc[freq] = {};
        acc[freq][gasto] = (acc[freq][gasto] || 0) + 1;
        return acc;
      },
      {} as Record<string, Record<string, number>>
    );

    return {
      kpis: {
        totalRespostas,
        percPagariamApp,
        avgBrandImportance,
        dominantGasto,
        dominantFidelidade,
      },
      distribution: { byRegionState: distByRegion },
      consumption: { freqGasto },
      digital: { paymentMethods: countOccurrences(filteredData, "forma_pagamento") },
      drivers: { topFactors },
      journey: { topServices, topPlacesOnTheWay },
      behavior: {
        convenienceUsage: groupByField(filteredData, "frequencia_conveniencia"),
        benefitPreferences: groupByField(
          filteredData,
          "forma_resgate_beneficios"
        ),
        fidelityDistribution: groupByField(filteredData, "nivel_fidelidade"),
      },
      detailedStateAnalysis,
    };
  }, [rawData, filters]);

// -----------------------------------------------------------------------------
// ÍCONES (MEMOIZADOS)
// -----------------------------------------------------------------------------

const iconFactory = (pathOrChildren: React.ReactNode) =>
  React.memo(() => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {pathOrChildren}
    </svg>
  ));

const TotalResponsesIcon = iconFactory(
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </>
);

const AverageSpendIcon = iconFactory(
  <>
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
  </>
);

const FidelityLevelIcon = iconFactory(
  <>
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </>
);

const BrandImportanceIcon = iconFactory(
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
);

const TopFactorIcon = iconFactory(
  <>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </>
);

const TopServiceIcon = iconFactory(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
);

// -----------------------------------------------------------------------------
// CHART GENÉRICO (Chart.js através de window.Chart)
// -----------------------------------------------------------------------------

const Chart = React.memo(
  ({
    type,
    data,
    options = {},
    height = "220px",
    theme,
  }: {
    type: string;
    data: any;
    options?: any;
    height?: string;
    theme?: string;
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<any>(null);

    const injectGradients = useCallback(
      (ctx: CanvasRenderingContext2D, chartData: any) => {
        if (!chartData || !chartData.datasets) return chartData;

        const createGradient = (colorStart: string, colorEnd: string) => {
          const gradient = ctx.createLinearGradient(0, ctx.canvas.height, 0, 0);
          gradient.addColorStop(0, colorStart);
          gradient.addColorStop(1, colorEnd);
          return gradient;
        };

        const greenGradient = createGradient("#3a6b1a", "#78BD42");
        const rubberGradient = createGradient("#1a202c", "#4A5568");
        const orangeGradient = createGradient("#c2410c", "#F78D1E");
        const lightGrayGradient = createGradient("#64748B", "#94A3B8");

        const newData = {
          ...chartData,
          datasets: chartData.datasets.map((dataset: any) => {
            const newDataset = { ...dataset };
            const mapColor = (color: string) => {
              if (color === "#78BD42") return greenGradient;
              if (color === "#2D3748") return rubberGradient;
              if (color === "#F78D1E") return orangeGradient;
              if (["#A0AEC0", "#CBD5E1", "#94A3B8"].includes(color))
                return lightGrayGradient;
              return color;
            };

            if (Array.isArray(newDataset.backgroundColor)) {
              newDataset.backgroundColor = newDataset.backgroundColor.map(mapColor);
            } else if (typeof newDataset.backgroundColor === "string") {
              newDataset.backgroundColor = mapColor(newDataset.backgroundColor);
            }

            const isBar = type === "bar" || newDataset.type === "bar" || type === "doughnut" || type === "pie";
            if (isBar) {
              newDataset.borderColor = theme === 'dark' ? '#334155' : '#000000';
              newDataset.borderWidth = 1;
              newDataset.borderSkipped = false;
            }

            return newDataset;
          }),
        };

        return newData;
      },
      [type, theme]
    );

    useEffect(() => {
      const ChartJS = (window as any).Chart;
      if (!canvasRef.current || !ChartJS) return;

      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      const gradientData = injectGradients(ctx, data);

      // Determine text color based on theme
      const textColor = theme === 'dark' ? '#F8FAFC' : '#64748B';
      const gridColor = theme === 'dark' ? '#334155' : '#E2E8F0';

      const baseOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600, easing: 'easeOutQuart' },
        layout: { padding: { top: 8, right: 8, bottom: 4, left: 8 } },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 7,
              padding: 14,
              font: { family: "Inter", size: 11, weight: "500" },
              color: textColor,
            },
          },
          ...(options.plugins || {}),
        },
        scales: {
          y: {
            display: options.scales?.y?.display ?? false,
            border: { display: false },
            grid: {
              display: true,
              color: theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.6)',
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              font: { size: 11, family: "'Inter', sans-serif" },
              padding: 8,
            },
            ...(options.scales?.y || {}),
          },
          x: {
            display: options.scales?.x?.display ?? false,
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: textColor,
              font: { size: 11, family: "'Inter', sans-serif" },
              padding: 6,
            },
            ...(options.scales?.x || {}),
          },
        },
        ...options,
      };

      const plugins = [];
      
      // CUSTOM GAUGE TEXT PLUGIN
      if (options.plugins?.gaugeCenterText) {
          plugins.push({
              id: 'gaugeCenterText',
              afterDraw: (chart: any) => {
                  const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
                  const pluginOptions = chart.options.plugins.gaugeCenterText;
                  if (!pluginOptions) return;
                  
                  ctx.save();
                  const text = pluginOptions.text;
                  ctx.font = 'bold 28px Inter';
                  ctx.fillStyle = pluginOptions.color;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  
                  // For a half-doughnut, the center of the arc is at the bottom of the visible chart area
                  const centerX = left + width / 2;
                  const centerY = bottom - 10;
                  
                  ctx.fillText(text, centerX, centerY);
                  ctx.restore();
              }
          });
      }

      if (!chartRef.current) {
        chartRef.current = new ChartJS(ctx, {
          type,
          data: gradientData,
          options: baseOptions,
          plugins: plugins,
        });
      } else {
        if (chartRef.current.config.type !== type) {
          chartRef.current.destroy();
          chartRef.current = new ChartJS(ctx, {
            type,
            data: gradientData,
            options: baseOptions,
            plugins: plugins,
          });
        } else {
          chartRef.current.data = gradientData;
          chartRef.current.options = baseOptions;
          chartRef.current.update('none');
        }
      }
    }, [data, type, options, height, injectGradients, theme]);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, []);

    return (
      <div style={{ position: "relative", height, width: "100%" }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    );
  }
);

// -----------------------------------------------------------------------------
// COMPONENTES BÁSICOS (Botão, Placeholders, Texto Formatado)
// -----------------------------------------------------------------------------

const ExplainButton = ({ onClick }: { onClick: () => void }) => (
  <button className="explain-btn" onClick={onClick} title="Clique para conversar com Ricardo">
    <img
      src="https://i.imgur.com/wLcpQ6o.jpeg"
      alt=""
      style={{ width: "18px", height: "18px", borderRadius: "50%" }}
    />
    Fale com Ricardo
  </button>
);

const CardPlaceholder = ({ text = "Carregando gráfico..." }: { text?: string }) => (
  <div className="card">
    <div className="card-placeholder">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  </div>
);

const KpiPlaceholder = () => (
  <div className="kpi-placeholder-container">
    <div className="placeholder-bar" style={{ width: "70%", height: "16px" }}></div>
    <div className="placeholder-bar" style={{ width: "40%", height: "28px" }}></div>
    <div
      className="placeholder-bar"
      style={{ width: "90%", height: "12px", marginTop: "16px" }}
    ></div>
    <div className="placeholder-bar" style={{ width: "80%", height: "12px" }}></div>
  </div>
);

const KpiCard = React.memo(
  ({
    label,
    value,
    icon,
    description,
  }: {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    description?: React.ReactNode;
  }) => (
    <div className="card kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-content">
          <div className="label">{label}</div>
          <div className="value">{value}</div>
        </div>
      </div>
      {description && <div className="card-description">{description}</div>}
    </div>
  )
);

const FormattedText = ({ text }: { text: string }) => {
  const paragraphs = text.split("\n");
  return (
    <>
      {paragraphs.map((paragraph, pIndex) => {
        if (!paragraph.trim()) return <br key={pIndex} />;
        
        const isBullet = paragraph.trim().startsWith("- ") || paragraph.trim().startsWith("* ");
        const content = isBullet ? paragraph.trim().substring(2) : paragraph;
        
        const parts = content.split(/(\*\*.*?\*\*)/g);
        
        const renderedContent = parts.map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
          }
          return <span key={index}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={pIndex} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '8px' }}>
              <span style={{ color: 'var(--primary-orange)', fontWeight: 'bold' }}>•</span>
              <div>{renderedContent}</div>
            </div>
          );
        }

        return (
          <div key={pIndex} style={{ marginBottom: "8px" }}>
            {renderedContent}
          </div>
        );
      })}
    </>
  );
};

// -----------------------------------------------------------------------------
// GAUGE
// -----------------------------------------------------------------------------

const GaugeChart = React.memo(
  ({
    value,
    title,
    description,
    onExplain,
    theme,
  }: {
    value: number;
    title: string;
    description?: React.ReactNode;
    onExplain?: () => void;
    theme: string;
  }) => {
    const data = useMemo(
      () => ({
        labels: ["Sim", "Não"],
        datasets: [
          {
            label: "Respostas",
            data: [value, 100 - value],
            backgroundColor: ["#78BD42", theme === 'dark' ? "#334155" : "#CBD5E1"],
            borderWidth: 0,
            circumference: 180,
            rotation: -90,
            borderRadius: 20,
          },
        ],
      }),
      [value, theme]
    );

    const options = useMemo(
      () => ({
        cutout: "70%",
        aspectRatio: 1.8,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 7,
                padding: 14,
                font: { size: 11 },
                color: theme === 'dark' ? '#F8FAFC' : '#64748B'
            },
          },
          tooltip: { enabled: false },
          gaugeCenterText: {
            text: `${value}%`,
            color: theme === 'dark' ? '#F1F5F9' : "#1f2937",
          },
          datalabels: { display: false },
        },
      }),
      [value, theme]
    );

    return (
      <div className="card gauge-chart-card">
        <h3>
          {title}
          {onExplain && <ExplainButton onClick={onExplain} />}
        </h3>
        {description && <div className="card-description">{description}</div>}
        <div
          className="gauge-container"
          style={{
            height: "220px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <Chart type="doughnut" data={data} options={options} height="100%" theme={theme} />
        </div>
      </div>
    );
  }
);

// -----------------------------------------------------------------------------
// HEATMAP
// -----------------------------------------------------------------------------

const HeatmapChart = React.memo(
  ({
    title,
    data,
    gastoLabels,
    freqLabels,
    description,
    className = "",
    onExplain,
    theme,
  }: {
    title: string;
    data: Record<string, Record<string, number>>;
    gastoLabels: string[];
    freqLabels: string[];
    description?: React.ReactNode;
    className?: string;
    onExplain?: () => void;
    theme: string;
  }) => {
    const [tooltip, setTooltip] = useState<{
      x: number;
      y: number;
      content: string;
    } | null>(null);

    const maxValue = useMemo(() => {
      let max = 0;
      Object.values(data).forEach((gastoGroup) => {
        Object.values(gastoGroup).forEach((val) => {
          if (val > max) max = val;
        });
      });
      return max > 0 ? max : 1;
    }, [data]);

    const getGradientStyle = (value: number) => {
      const opacity = value > 0 ? 0.15 + (value / maxValue) * 0.85 : 0.03;
      if (value === 0) return { background: "var(--heatmap-bg-empty)" };
      return {
        background: `linear-gradient(0deg, rgba(77, 138, 36, ${opacity}) 0%, rgba(120, 189, 66, ${opacity}) 100%)`,
      };
    };

    useEffect(() => {
      const handleScroll = () => {
        if (tooltip) setTooltip(null);
      };
      window.addEventListener("scroll", handleScroll, true);
      return () => window.removeEventListener("scroll", handleScroll, true);
    }, [tooltip]);

    return (
      <div className={`card heatmap ${className}`}>
        <h3>
          {title}
          {onExplain && <ExplainButton onClick={onExplain} />}
        </h3>
        {description && <div className="card-description">{description}</div>}
        <table style={{ borderCollapse: "separate", borderSpacing: "4px" }}>
          <thead>
            <tr>
              <th
                style={{
                  backgroundColor: "transparent",
                  textAlign: "left",
                  paddingBottom: "8px",
                }}
              >
                Frequência
              </th>
              {gastoLabels.map((label) => (
                <th
                  key={label}
                  style={{
                    backgroundColor: "transparent",
                    paddingBottom: "8px",
                    fontSize: "10px",
                  }}
                >
                  {simplifyLabel(label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {freqLabels.map((freq) => (
              <tr key={freq}>
                <td
                  className="row-header"
                  style={{ fontSize: "11px", paddingRight: "12px" }}
                >
                  {simplifyLabel(freq)}
                </td>
                {gastoLabels.map((gasto) => {
                  const value = data[freq]?.[gasto] || 0;
                  const isMax = value === maxValue && value > 0;
                  const style = getGradientStyle(value);

                  return (
                    <td
                      key={gasto}
                      style={{
                        ...style,
                        borderRadius: "6px",
                        border: isMax ? "2px solid var(--heatmap-max-border)" : "none",
                        fontWeight: isMax ? "700" : "500",
                        position: "relative",
                        color: value > maxValue / 2 ? "var(--heatmap-text-high)" : "var(--subtle-text-color)",
                        cursor: "help",
                        height: "32px",
                        textAlign: "center",
                        fontSize: "11px",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                          content: `Frequência: ${simplifyLabel(
                            freq
                          )}\nGasto Médio: ${simplifyLabel(
                            gasto
                          )}\nRespostas: ${value}`,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      {value > 0 ? value : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {tooltip &&
          document.body &&
          createPortal(
            <div
              className="heatmap-tooltip"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              {tooltip.content}
            </div>,
            document.body
          )}
      </div>
    );
  }
);

// -----------------------------------------------------------------------------
// LINK DESTACADO
// -----------------------------------------------------------------------------

const LinkedInsight = ({ href, children }: { href: string; children?: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "var(--primary-orange)",
      fontWeight: "600",
      textDecoration: "none",
      cursor: "pointer",
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.textDecoration = "underline";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.textDecoration = "none";
    }}
  >
    {children}
  </a>
);

// -----------------------------------------------------------------------------
// ASSISTENTE RICARDO (CHAT)
// -----------------------------------------------------------------------------

const RicardoAssistant = forwardRef<
  RicardoAssistantHandle,
  { 
    dashboardData: any; 
    userName: string; 
    userRegion: string;
    onLinkClick: () => void;
  }
>(({ dashboardData, userName, userRegion, onLinkClick }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const playNotificationSound = useCallback(() => {
    if (isOpen) return;
    try {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      );
      audio.volume = 0.1;
      audio.play().catch(() => {});
    } catch (e) {
      console.error("Error playing sound", e);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!hasInitialized.current && userName) {
      const firstName = userName.split(" ")[0];
      const initialMessage = `Fala, ${firstName}! Tudo certo?\n\nSou o Ricardo. Já analisei os dados da região ${
        userRegion || "do Brasil"
      }. Se quiser algum insight, é só clicar nos botões de "Fale com Ricardo" nos gráficos.`;
      setMessages([{ id: 1, text: initialMessage, sender: "ricardo" }]);
      hasInitialized.current = true;
    }
  }, [userName, userRegion]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === "ricardo" && lastMsg.id !== 1) {
        playNotificationSound();
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, playNotificationSound]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(
    async (textOverride?: string, chartKey?: string) => {
      const textToSend = textOverride || userInput;
      if (!textToSend.trim() || !dashboardData) return;
      if (isLoading && !textOverride) return;

      const lower = textToSend.toLowerCase();

      // Quick responses for common queries
      if (
        lower.includes("tenho outra dúvida") ||
        lower.includes("tenho dúvidas") ||
        lower.includes("tenho dúvida")
      ) {
        const newUserMessage: AiMessage = {
          id: Date.now(),
          text: textToSend,
          sender: "user",
        };
        const botResponse: AiMessage = {
          id: Date.now() + 1,
          text: "Claro! Pode perguntar qualquer coisa sobre os dados da sua região.",
          sender: "ricardo",
        };
        setMessages((prev) => [...prev, newUserMessage, botResponse]);
        setUserInput("");
        if (inputRef.current) inputRef.current.style.height = 'auto';
        return;
      }

      const recommendation = chartKey
        ? getContextualRecommendation(userRegion, chartKey)
        : undefined;

      const newUserMessage: AiMessage = {
        id: Date.now(),
        text: textToSend,
        sender: "user",
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setUserInput("");
      if (inputRef.current) inputRef.current.style.height = 'auto';
      setIsLoading(true);

      try {
        const conversationHistory = messages
          .slice(-6) // Increased history context
          .map(
            (m) =>
              `${m.sender === "user" ? "Revendedor" : "Ricardo"}: ${m.text}`
          )
          .join("\n");

        let promptModeInstruction =
          "Seja direto, amigável e use emojis com moderação. Responda como um consultor experiente.";
        
        if (lower.includes("saber mais") || lower.includes("detalhe") || lower.includes("explica")) {
          promptModeInstruction =
            "MODO DETALHADO: Explique o 'porquê' por trás dos dados. Use analogias simples de posto de gasolina.";
        } else if (
          lower.includes("como fazer") ||
          lower.includes("dica") ||
          lower.includes("ação")
        ) {
          promptModeInstruction =
            "MODO AÇÃO: Dê 3 passos práticos e numerados que o revendedor pode fazer amanhã.";
        }

        const prompt = `
Você é o **Ricardo**, o consultor de inteligência artificial do ClubPetro.
Sua missão é ajudar revendedores de combustíveis a venderem mais e fidelizarem clientes.

CONTEXTO DO USUÁRIO:
- Região do Posto: **${userRegion}**
- Nome do Usuário: **${userName}**

DADOS DO PAINEL (Use estes números para embasar sua resposta):
${JSON.stringify({
  kpis: dashboardData.kpis,
  topFactors: dashboardData.drivers.topFactors,
  digitalPayments: dashboardData.digital.paymentMethods,
}, null, 2)}

HISTÓRICO DA CONVERSA:
${conversationHistory}

PERGUNTA ATUAL: "${textToSend}"

INSTRUÇÃO DE ESTILO: ${promptModeInstruction}

DIRETRIZES:
1. **Personalidade:** Você é parceiro, entende das dores do dono de posto (margem apertada, concorrência, frentista desmotivado).
2. **Formatação:** Use **negrito** para destacar números e insights chave. Use parágrafos curtos.
3. **Contexto Regional:** Sempre que possível, compare o desempenho dele com a região ${userRegion}.
4. **Sem enrolação:** Vá direto ao ponto. Se não souber, diga que precisa de mais dados.
        `;

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: prompt,
        });

        const responseText =
          (response as any).text ??
          "Opa, a conexão oscilou aqui. Pode repetir a pergunta?";

        const aiResponse: AiMessage = {
          id: Date.now() + 1,
          text: responseText,
          sender: "ricardo",
          linkTitle: recommendation?.title,
          linkUrl: recommendation?.url,
        };
        setMessages((prev) => [...prev, aiResponse]);

        if (chartKey) {
          setTimeout(() => {
            const followUpMsg: AiMessage = {
              id: Date.now() + 10000,
              text: "Quer que eu detalhe alguma parte ou partimos para a próxima análise?",
              sender: "ricardo",
              suggestions: [
                "Me dê um plano de ação",
                "Explicar melhor esse dado",
                "Ver outra análise",
              ],
            };
            setMessages((prev) => [...prev, followUpMsg]);
          }, 8000);
        }
      } catch (error) {
        console.error("Ricardo AI Error:", error);
        const errorResponse: AiMessage = {
          id: Date.now() + 1,
          text: "Eita, minha conexão falhou rapidinho. Tenta mandar de novo?",
          sender: "ricardo",
        };
        setMessages((prev) => [...prev, errorResponse]);
      } finally {
        setIsLoading(false);
      }
    },
    [userInput, isLoading, dashboardData, userRegion, messages, userName]
  );

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  useImperativeHandle(ref, () => ({
    askQuestion: (question: string, chartKey: string) => {
      setIsOpen(true);
      handleSendMessage(question, chartKey);
    },
  }));

  return (
    <>
      <div className={`ricardo-chat-window ${isOpen ? "open" : ""}`}>
        <div className="ricardo-banner">
          <img
            src="https://i.imgur.com/N6HZDNW.jpeg"
            alt="ClubPetro"
            className="ricardo-banner-logo"
          />
          <button className="ricardo-close-btn" onClick={() => setIsOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="ricardo-profile-bar">
          <div className="ricardo-header-avatar">
            <img src="https://i.imgur.com/wLcpQ6o.jpeg" alt="Ricardo" />
          </div>
          <div className="ricardo-profile-info">
            <h3>Ricardo</h3>
            <div className="ricardo-status-text">Online</div>
          </div>
        </div>
        <div className="ricardo-messages" ref={messagesEndRef}>
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <div className={`ricardo-message ${msg.sender}`}>
                <FormattedText text={msg.text} />
              </div>
              {msg.sender === "ricardo" && msg.linkUrl && msg.linkTitle && (
                <a
                  href={msg.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ricardo-action-btn"
                  onClick={() => {
                    if (onLinkClick) onLinkClick();
                  }}
                >
                  Resolva com {msg.linkTitle}
                </a>
              )}
              {msg.sender === "ricardo" && msg.suggestions && (
                <div className="ricardo-suggestion-chips">
                  {msg.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="ricardo-chip"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
          {isLoading && (
            <div className="ricardo-message ricardo">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
        </div>
        <div className="ricardo-input-area">
          <textarea
            ref={inputRef}
            className="ricardo-input"
            placeholder="Pergunte ao Ricardo..."
            value={userInput}
            onChange={handleInputResize}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            rows={1}
          />
          <button
            className="ricardo-send-btn"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !userInput.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
      <button
        className="ricardo-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Falar com Ricardo"
      >
        <img
          src="https://i.imgur.com/wLcpQ6o.jpeg"
          alt="Ricardo ClubPetro"
          className="ricardo-avatar-img"
        />
      </button>
    </>
  );
});

// -----------------------------------------------------------------------------
// MODAIS DE REGIÃO / PDF
// -----------------------------------------------------------------------------

const RegionModal = ({ onSelect }: { onSelect: (region: string) => void }) => {
  const regions = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
  return (
    <div className="region-modal-backdrop">
      <div className="region-modal-content">
        <div className="region-modal-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
        <h2 className="region-modal-title">Bem-vindo ao Painel</h2>
        <p className="region-modal-subtitle">
          Selecione uma região para visualizar os dados personalizados.
        </p>
        <div className="region-modal-buttons">
          {regions.map((region) => (
            <button
              key={region}
              className="region-modal-button"
              onClick={() => onSelect(region)}
            >
              {region}
            </button>
          ))}
        </div>
        <button className="region-modal-all-button" onClick={() => onSelect("Brasil")}>
          Brasil (Consolidado)
        </button>
      </div>
    </div>
  );
};

const PdfExportModal = ({
  onSelect,
  onClose,
}: {
  onSelect: (region: string) => void;
  onClose: () => void;
}) => {
  const regions = ["Brasil", "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];
  return (
    <div
      className="region-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="region-modal-content">
        <button className="modal-close-btn" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div
          className="region-modal-icon"
          style={{
            background: "rgba(247, 141, 30, 0.1)",
            color: "var(--primary-orange)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h2 className="region-modal-title">Exportar Relatório</h2>
        <p className="region-modal-subtitle">
          Escolha a região dos dados que você deseja incluir no relatório PDF.
        </p>
        <div
          className="region-modal-buttons"
        >
          {regions.map((region) => (
            <button
              key={region}
              className="region-modal-button"
              onClick={() => onSelect(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// DASHBOARD PRINCIPAL
// -----------------------------------------------------------------------------

const Dashboard = ({
  onLogout,
  userName,
  userId,
  theme,
  toggleTheme,
}: {
  onLogout: () => void;
  userName: string;
  userId: number | null;
  theme: string;
  toggleTheme: () => void;
}) => {
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegionSelected, setIsRegionSelected] = useState(false);
  const [activeRegion, setActiveRegion] = useState("");
  const [filters, setFilters] = useState({ region: "" });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "responses",
    direction: "desc",
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const ricardoRef = useRef<RicardoAssistantHandle>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError("Falha na conexão com o banco de dados. Verifique a configuração.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("bd_habitos_consumo_2025")
        .select("*");
      if (fetchError) {
        console.error("Error fetching data:", fetchError);
        setError(`Falha ao carregar os dados. Motivo: "${fetchError.message}".`);
      } else {
        setRawData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const data = useDashboardData(rawData, filters);

  const handleRegionSelect = useCallback((region: string) => {
    setActiveRegion(region);
    const filterRegion = region === "Brasil" ? "Todos" : region;
    setFilters({ region: filterRegion });
    setIsSidebarOpen(false);
  }, []);

  const handleInitialRegionSelect = async (region: string) => {
    handleRegionSelect(region);
    setIsRegionSelected(true);
    if (userId && supabase) {
      try {
        await supabase.from("Login_Habitos_2025").update({ regiao: region }).eq("id", userId);
      } catch {
        // silencioso
      }
    }
  };

  const handleMaterialsClick = async () => {
    if (userId && supabase) {
        try {
            await supabase.from("Login_Habitos_2025").update({ acessou_materiais: true }).eq("id", userId);
        } catch (err) {
            console.error("Erro ao registrar clique em materiais", err);
        }
    }
  };

  const handleFeatureClick = async (featureName: string) => {
    if (userId && supabase) {
        try {
            await supabase.from("Login_Habitos_2025").update({ funcionalidade: featureName }).eq("id", userId);
        } catch (err) {
            console.error("Erro ao registrar clique em funcionalidade", err);
        }
    }
  };

  const handleRicardoLinkClick = async () => {
    if (userId && supabase) {
        try {
            await supabase.from("Login_Habitos_2025").update({ material_ricardo: true }).eq("id", userId);
        } catch (err) {
            console.error("Erro ao registrar clique em material do Ricardo", err);
        }
    }
  };

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const handleExplainChart = (chartName: string, chartKey: string) => {
    if (ricardoRef.current) {
      ricardoRef.current.askQuestion(
        `Me explique o quadrante '${chartName}' e me dê uma recomendação prática`,
        chartKey
      );
    }
  };

  const tableHeaders = useMemo(
    () => [
      { key: "rank", label: "#" },
      { key: "state", label: "Estado" },
      { key: "region", label: "Região" },
      { key: "responses", label: "Nº de Respostas" },
      { key: "dominantGasto", label: "Gasto Médio Dominante" },
      { key: "dominantFreq", label: "Frequência Dominante" },
    ],
    []
  );

  const sortedStateAnalysis = useMemo(() => {
    if (!data?.detailedStateAnalysis) return [];
    const sortableItems = [...data.detailedStateAnalysis];
    sortableItems.sort((a: any, b: any) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

    return sortableItems.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [data?.detailedStateAnalysis, sortConfig]);

  const maxResponses = useMemo(() => {
    if (!sortedStateAnalysis || sortedStateAnalysis.length === 0) return 1;
    return Math.max(...sortedStateAnalysis.map((s) => s.responses));
  }, [sortedStateAnalysis]);

  const handleExportCsv = () => {
    if (!sortedStateAnalysis || sortedStateAnalysis.length === 0) return;
    const headers = tableHeaders
      .filter((h) => h.key !== "rank")
      .map((h) => h.label)
      .join(",");
    const csvContent = sortedStateAnalysis
      .map((row: any) =>
        tableHeaders
          .filter((h) => h.key !== "rank")
          .map((header) =>
            String(row[header.key as keyof typeof row]).replace(/"/g, '""')
          )
          .join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + `${headers}\n${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "analise_detalhada_por_estado.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const prepareElementForPdf = async (element: HTMLElement): Promise<HTMLElement> => {
    // Clone the main element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.classList.add("pdf-export-mode");
    
    // Add specific class to force desktop layout in CSS
    clone.classList.add("force-desktop");

    const elementsToRemove = clone.querySelectorAll(
      ".explain-btn, .csv-export-button, .pdf-button, .ricardo-fab, .modal-close-btn, .mobile-menu-toggle, .theme-toggle-btn, .sidebar-overlay, .sidebar"
    );
    elementsToRemove.forEach((el) => el.remove());

    // Remove min-height from main-content clone (prevents huge whitespace)
    clone.style.minHeight = "0";
    clone.style.flex = "none";

    // Inject PDF specific styles
    const style = document.createElement("style");
    style.innerHTML = `
      .pdf-export-mode {
        font-family: 'Inter', sans-serif !important;
        color: #111 !important;
        background: #fff !important;
        padding: 28px !important;
        width: 1080px !important;
        max-width: 1080px !important;
        min-width: 1080px !important;
        min-height: 0 !important;
        height: auto !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        overflow: visible !important;
      }
      .pdf-export-mode * {
        box-sizing: border-box !important;
        transition: none !important;
        animation: none !important;
      }
      .pdf-export-mode .card {
        box-shadow: none !important;
        border: 1px solid #e0e0e0 !important;
        border-radius: 10px !important;
        background: #fff !important;
        margin-bottom: 0 !important;
        padding: 18px !important;
        overflow: hidden !important;
        transform: none !important;
        content-visibility: visible !important;
        contain-intrinsic-size: auto !important;
      }
      .pdf-export-mode .card::after {
        display: none !important;
      }
      .pdf-export-mode .card:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      .pdf-export-mode h1, .pdf-export-mode h2, .pdf-export-mode h3 {
        color: #000 !important;
        margin-top: 0 !important;
      }
      .pdf-export-mode .section-header {
        margin-bottom: 10px !important;
      }
      .pdf-export-mode .section-header h2 {
        font-size: 16px !important;
        margin-bottom: 0 !important;
      }
      .pdf-export-mode .dashboard-section {
        margin-bottom: 14px !important;
        padding: 0 !important;
      }
      .pdf-export-mode .kpi-card {
        border-top: 3px solid #F78D1E !important;
        padding: 12px !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: flex-start !important;
        gap: 6px !important;
      }
      .pdf-export-mode .kpi-header {
        margin-bottom: 0 !important;
        gap: 10px !important;
      }
      .pdf-export-mode .kpi-icon {
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        border-radius: 8px !important;
      }
      .pdf-export-mode .kpi-card .label {
        font-size: 0.6rem !important;
        margin-bottom: 1px !important;
      }
      .pdf-export-mode .kpi-card .value {
        font-size: 1.1rem !important;
        color: #000 !important;
        font-weight: 800 !important;
      }
      .pdf-export-mode .kpi-card .card-description {
        font-size: 0.7rem !important;
        line-height: 1.4 !important;
        margin-top: 4px !important;
        color: #555 !important;
      }
      .pdf-export-mode .card h3 {
        font-size: 0.95rem !important;
        margin-bottom: 10px !important;
        gap: 8px !important;
      }
      .pdf-export-mode .card .card-description {
        font-size: 0.8rem !important;
        margin-bottom: 12px !important;
      }
      .pdf-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 14px;
        border-bottom: 3px solid #F78D1E;
        width: 100% !important;
      }
      .pdf-footer {
        margin-top: 20px;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 9px;
        color: #6b7280;
        width: 100% !important;
      }
      .pdf-export-mode .grid {
        display: grid !important;
        gap: 12px !important;
        width: 100% !important;
        align-items: stretch !important;
      }
      .pdf-export-mode .col-span-2 {
        grid-column: span 2 !important;
      }
      .pdf-export-mode a {
        color: #F78D1E !important;
        text-decoration: underline !important;
        font-weight: 600 !important;
      }
      .pdf-export-mode table {
        width: 100% !important;
        border-collapse: collapse !important;
        font-size: 11px !important;
      }
      .pdf-export-mode table th,
      .pdf-export-mode table td {
        padding: 6px 8px !important;
        border-bottom: 1px solid #e5e7eb !important;
        text-align: left !important;
      }
      .pdf-export-mode table th {
        background: #f3f4f6 !important;
        font-weight: 700 !important;
        color: #111 !important;
      }
      .pdf-export-mode .gauge-chart-card canvas,
      .pdf-export-mode .gauge-chart-card img {
        max-height: 200px !important;
      }
    `;
    clone.appendChild(style);

    const headerDiv = document.createElement("div");
    headerDiv.className = "pdf-header";
    headerDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px;">
        <img src="https://i.imgur.com/N6HZDNW.jpeg" alt="Logo ClubPetro" style="height: 50px; object-fit: contain;" />
      </div>
      <div style="text-align: right;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #111;">Relatório de Inteligência</h1>
        <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">
          Análise Regional: <strong>${activeRegion || "Brasil"}</strong>
        </p>
        <p style="margin: 2px 0 0; color: #6b7280; font-size: 12px;">
          Gerado em: ${new Date().toLocaleDateString("pt-BR")}
        </p>
      </div>
    `;
    clone.insertBefore(headerDiv, clone.firstChild);

    const footerDiv = document.createElement("div");
    footerDiv.className = "pdf-footer";
    footerDiv.innerHTML = `<p>ClubPetro Inteligência de Mercado • www.clubpetro.com • Uso exclusivo</p>`;
    clone.appendChild(footerDiv);

    // FIX: Adjust grid columns for PDF readability (A4 Portrait)
    // 4 cols -> keep 4 cols for KPIs (compact, fills page well)
    const gridCols4 = clone.querySelectorAll('.grid-cols-4');
    gridCols4.forEach(el => (el as HTMLElement).style.gridTemplateColumns = 'repeat(4, 1fr)');

    // 2 cols -> keep 2 cols
    const gridCols2 = clone.querySelectorAll('.grid-cols-2');
    gridCols2.forEach(el => (el as HTMLElement).style.gridTemplateColumns = 'repeat(2, 1fr)');

    // 1 cols -> 1 col
    const gridCols1 = clone.querySelectorAll('.grid-cols-1');
    gridCols1.forEach(el => (el as HTMLElement).style.gridTemplateColumns = '1fr');

    // FIX: Set a fixed standard width optimized for A4 scaling
    const fixedWidth = "1080px";
    clone.style.width = fixedWidth;
    clone.style.maxWidth = fixedWidth;
    clone.style.minWidth = fixedWidth;
    clone.style.height = "auto";
    clone.style.minHeight = "0";
    clone.style.overflow = "visible";
    clone.style.position = "relative";
    clone.style.margin = "0";
    clone.style.padding = "28px";
    clone.style.transform = "none";
    clone.style.backgroundColor = "#ffffff";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.flex = "none";

    // --- CHART SNAPSHOT FIX (CRITICAL) ---
    const originalCanvases = Array.from(element.querySelectorAll("canvas"));
    const clonedCanvases = Array.from(clone.querySelectorAll("canvas"));

    originalCanvases.forEach((originalCanvas, index) => {
      if (clonedCanvases[index]) {
        try {
          // Increase pixel density for sharper charts in PDF
          const imgUrl = originalCanvas.toDataURL("image/png", 3.0); // Increased quality
          const img = document.createElement("img");
          
          img.src = imgUrl;
          img.style.width = "100%";
          img.style.height = "auto";
          img.style.display = "block";
          img.style.objectFit = "contain"; 
          
          clonedCanvases[index].parentNode?.replaceChild(img, clonedCanvases[index]);
        } catch (e) {
          console.error("Error swapping canvas for image", e);
        }
      }
    });

    return clone;
  };

  const executePdfGeneration = async () => {
    if (!contentRef.current || isPdfGenerating) return;
    setIsPdfGenerating(true);
    
    const scrollPos = window.scrollY;
    
    try {
      if (userId && supabase) {
        await supabase
          .from("Login_Habitos_2025")
          .update({ baixou: true })
          .eq("id", userId);
      }
    } catch {
      // silencioso
    }

    let tempContainer = document.getElementById("pdf-temp-container");
    if (tempContainer) document.body.removeChild(tempContainer);
    
    tempContainer = document.createElement("div");
    tempContainer.id = "pdf-temp-container";
    
    // Set absolute positioning
    const domWidth = 1080; // Match the fixed width in prepareElementForPdf
    tempContainer.style.position = "absolute";
    tempContainer.style.top = "0";
    tempContainer.style.left = "0";
    tempContainer.style.width = `${domWidth}px`; 
    tempContainer.style.zIndex = "-1000"; 
    tempContainer.style.visibility = "visible"; // Must be visible for html2canvas
    tempContainer.style.backgroundColor = "#ffffff";
    tempContainer.style.overflow = "hidden"; // Prevent spillover
    document.body.appendChild(tempContainer);

    window.scrollTo(0, 0);

    try {
      await (document as any).fonts.ready;
      const preparedClone = await prepareElementForPdf(contentRef.current);
      tempContainer.appendChild(preparedClone);
      
      // Wait for images to render
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Increased wait time

      const a4WidthMm = 210; 
      const pxToMm = a4WidthMm / domWidth;

      // --- CAPTURE LINKS FOR PDF ---
      const linksToMap: { x: number; y: number; w: number; h: number; url: string }[] = [];
      const cloneLinks = preparedClone.querySelectorAll("a");
      
      const cloneRect = preparedClone.getBoundingClientRect();
      const originX = cloneRect.left;
      const originY = cloneRect.top;

      cloneLinks.forEach((link) => {
        const url = link.getAttribute("href");
        if (url && (url.startsWith("http") || url.startsWith("www"))) {
          const rect = link.getBoundingClientRect();
          const relLeft = rect.left - originX;
          const relTop = rect.top - originY;
          
          if (rect.width > 0 && rect.height > 0) {
              const x = relLeft * pxToMm;
              const y = relTop * pxToMm;
              const w = rect.width * pxToMm;
              const h = rect.height * pxToMm;
              
              linksToMap.push({ x, y, w, h, url });
          }
        }
      });

      const canvas = await (window as any).html2canvas(preparedClone, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#FFFFFF",
        width: domWidth, 
        windowWidth: domWidth, 
        scrollY: 0,
        scrollX: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc: Document) => {
            const el = clonedDoc.querySelector('.pdf-export-mode') as HTMLElement;
            if (el) {
                el.style.transform = 'none';
                el.style.margin = '0';
            }
        }
      });

      const { jsPDF } = (window as any).jspdf;
      
      // Calculate PDF height based on aspect ratio
      const pdfHeight = (canvas.height * pxToMm) / 2; // Divide by scale (2)

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [a4WidthMm, pdfHeight], // Custom long page to fit everything
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95); // JPEG is smaller/faster
      
      pdf.addImage(imgData, "JPEG", 0, 0, a4WidthMm, pdfHeight);

      linksToMap.forEach(({ x, y, w, h, url }) => {
        pdf.link(x, y, w, h, { url });
      });

      pdf.save(`Relatorio_ClubPetro_${activeRegion || "Brasil"}.pdf`);
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
      window.scrollTo(0, scrollPos);
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
      setIsPdfGenerating(false);
    }
  };

  const handlePdfRegionSelect = (region: string) => {
    setIsPdfModalOpen(false);
    handleRegionSelect(region);
    setTimeout(() => executePdfGeneration(), 1500);
  };

  const gastoLabels = useMemo(
    () => getUniqueValues(rawData || [], "gasto_medio"),
    [rawData]
  );
  const freqLabels = useMemo(
    () => getUniqueValues(rawData || [], "frequencia_abastecimento"),
    [rawData]
  );

  const freqGastoBarData = useMemo(
    () =>
      !loading && data
        ? {
            labels: freqLabels.map(simplifyLabel),
            datasets: [
              ...gastoLabels.map((gasto, index) => ({
                type: "bar",
                label: simplifyLabel(gasto),
                data: freqLabels.map(
                  (freq) => data.consumption.freqGasto[freq]?.[gasto] || 0
                ),
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                borderRadius: 4,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
              })),
              {
                type: "line",
                label: "Tendência Total",
                data: freqLabels.map((freq) =>
                  gastoLabels.reduce(
                    (sum, gasto) =>
                      sum + (data.consumption.freqGasto[freq]?.[gasto] || 0),
                    0
                  )
                ),
                borderColor: "#F78D1E",
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: "#fff",
                pointBorderColor: "#F78D1E",
                fill: false,
                order: 0,
                yAxisID: "y1",
              },
            ],
          }
        : {},
    [loading, data, freqLabels, gastoLabels]
  );

  const toMultiDataset = (items: { label: string; value: number }[]) => ({
    labels: [""],
    datasets: items.map((item, index) => ({
      label: simplifyLabel(item.label),
      data: [item.value],
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
      borderRadius: 6,
      barPercentage: 0.9, 
      categoryPercentage: 0.9,
      hoverOffset: 8,
    })),
  });

  const paymentMethodsChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.digital.paymentMethods.map((d) => simplifyLabel(d.label)),
      datasets: [
        {
          data: data.digital.paymentMethods.map((d) => d.value),
          backgroundColor: CHART_COLORS,
          borderWidth: 2,
          borderColor: theme === 'dark' ? '#1E293B' : "#ffffff",
          hoverOffset: 8,
        },
      ],
    };
  }, [data, theme]);

  const convenienceUsageChartData = useMemo(
    () => (data ? toMultiDataset(data.behavior.convenienceUsage) : null),
    [data]
  );

  const fidelityDistributionChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.behavior.fidelityDistribution.map((d) => simplifyLabel(d.label)),
      datasets: [
        {
          data: data.behavior.fidelityDistribution.map((d) => d.value),
          backgroundColor: CHART_COLORS,
          borderWidth: 2,
          borderColor: theme === 'dark' ? '#1E293B' : "#ffffff",
          cutout: "50%", 
        },
      ],
    };
  }, [data, theme]);

  const benefitPreferencesChartData = useMemo(
    () => (data ? toMultiDataset(data.behavior.benefitPreferences) : null),
    [data]
  );

  const topFactorsChartData = useMemo(
    () => (data ? toMultiDataset(data.drivers.topFactors) : null),
    [data, filters.region]
  );

  const topServicesChartData = useMemo(() => {
    if (!data) return null;
    const items = data.journey.topServices;
    return {
      labels: items.map((d) => simplifyLabel(d.label)),
      datasets: [
        {
          type: "bar",
          label: "Interesse",
          data: items.map((d) => d.value),
          backgroundColor: CHART_COLORS.slice(0, items.length),
          borderRadius: 4,
          barPercentage: 0.9, 
          categoryPercentage: 0.9,
        },
      ],
    };
  }, [data, filters.region]);

  const topPlacesChartData = useMemo(() => {
    if (!data) return null;
    return {
      labels: data.journey.topPlacesOnTheWay.map((d) => simplifyLabel(d.label)),
      datasets: [
        {
          label: "Locais",
          data: data.journey.topPlacesOnTheWay.map((d) => d.value),
          backgroundColor: "rgba(120, 189, 66, 0.1)",
          borderColor: "#78BD42",
          borderWidth: 2,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#78BD42",
          pointRadius: 4,
        },
      ],
    };
  }, [data, filters.region]);

  if (!isRegionSelected) {
    return <RegionModal onSelect={handleInitialRegionSelect} />;
  }

  if (error) {
    return (
      <div
        className="loading-container"
        style={{ color: "var(--primary-green)", padding: "32px", textAlign: "center", lineHeight: "1.6" }}
      >
        {error}
      </div>
    );
  }

  const regionName =
    activeRegion === "Brasil" || activeRegion === "" ? "Brasil" : `região ${activeRegion}`;

  const dataExists = !loading && data && data.kpis.totalRespostas > 0;

  const kpiDescriptions = dataExists
    ? {
        totalRespostas: `Volume total de motoristas entrevistados na análise. Foram ouvidas ${formatNumber(
          data.kpis.totalRespostas
        )} pessoas para garantir a confiabilidade dos dados.`,
        dominantGasto: `Faixa de valor mais comum gasta por abastecimento. A maioria dos clientes costuma gastar ${data.kpis.dominantGasto} a cada visita.`,
        dominantFidelidade: `Autopercepção de fidelidade mais comum entre os clientes. O perfil predominante se declara "${data.kpis.dominantFidelidade}".`,
        avgBrandImportance: `Nota média de importância atribuída à bandeira do posto (escala 1-5). A relevância média da marca para o público é de ${data.kpis.avgBrandImportance}.`,
      }
    : ({} as any);

  const digitalDescriptions = dataExists
    ? {
        pagariamApp: (
          <>
            Observando o comportamento no {regionName}, notamos que{" "}
            {data.kpis.percPagariamApp}% dos clientes baixariam um aplicativo do
            posto em troca de descontos.
            <br />
            <br />
            Isso indica uma oportunidade latente de digitalização local. Para
            capturar essa demanda, a estratégia ideal é{" "}
            <LinkedInsight
              href={getContextualRecommendation(activeRegion, "pagariamApp").url}
            >
              {getContextualRecommendation(activeRegion, "pagariamApp").actionPhrase}
            </LinkedInsight>{" "}
            e reduzir a dependência de plataformas de terceiros.
          </>
        ),
        paymentMethods: (
          <>
            Aqui no {regionName}, o método "
            {simplifyLabel(
              data.digital.paymentMethods[0]?.label || "N/A"
            )}
            " lidera a preferência no momento do pagamento.
            <br />
            <br />
            A agilidade no caixa é um diferencial competitivo na nossa região. Para
            otimizar o fluxo e fidelizar, recomendamos{" "}
            <LinkedInsight
              href={getContextualRecommendation(activeRegion, "paymentMethods").url}
            >
              {getContextualRecommendation(activeRegion, "paymentMethods").actionPhrase}
            </LinkedInsight>
            .
          </>
        ),
      }
    : ({} as any);

  const behaviorDescriptions = dataExists
    ? {
        convenienceUsage: (
          <>
            Analisando a conversão pista-loja no {regionName}, o comportamento mais
            comum registrado foi "
            {data.behavior.convenienceUsage[0]?.label.toLowerCase() || "N/A"}".
            <br />
            <br />
            Para aumentar o ticket médio e o fluxo na conveniência, a chave é a
            comunicação assertiva. Você pode{" "}
            <LinkedInsight
              href={getContextualRecommendation(
                activeRegion,
                "convenienceUsage"
              ).url}
            >
              {
                getContextualRecommendation(activeRegion, "convenienceUsage")
                  .actionPhrase
              }
            </LinkedInsight>{" "}
            para convidá-lo a entrar.
          </>
        ),
        fidelityDistribution: (
          <>
            A maior fatia do público regional se identifica como "
            {data.behavior.fidelityDistribution[0]?.label || "N/A"}", revelando o
            grau de retenção atual.
            <br />
            <br />
            Entender esse perfil é o primeiro passo para ações de retenção eficazes.
            É fundamental{" "}
            <LinkedInsight
              href={getContextualRecommendation(
                activeRegion,
                "fidelityDistribution"
              ).url}
            >
              {
                getContextualRecommendation(activeRegion, "fidelityDistribution")
                  .actionPhrase
              }
            </LinkedInsight>{" "}
            para transformar clientes casuais em fãs da marca.
          </>
        ),
        benefitPreferences: (
          <>
            Quando perguntamos sobre recompensas, o benefício "
            {simplifyLabel(
              data.behavior.benefitPreferences[0]?.label || "N/A"
            )}
            " foi o favorito na região.
            <br />
            <br />
            O engajamento nasce da recompensa certa. Para o seu público, a chave
            para o sucesso é{" "}
            <LinkedInsight
              href={getContextualRecommendation(
                activeRegion,
                "benefitPreferences"
              ).url}
            >
              {
                getContextualRecommendation(activeRegion, "benefitPreferences")
                  .actionPhrase
              }
            </LinkedInsight>{" "}
            de forma personalizada.
          </>
        ),
      }
    : ({} as any);

  const driversDescriptions = dataExists
    ? {
        topFactors: (
          <>
            No {regionName}, o fator "
            {simplifyLabel(data.drivers.topFactors[0]?.label || "N/A")}" é o que
            mais pesa na decisão de abastecer.
            <br />
            <br />
            Sabendo que este é o critério decisivo para o seu cliente, foque sua
            operação nisso. É vital{" "}
            <LinkedInsight
              href={getContextualRecommendation(activeRegion, "topFactors").url}
            >
              {getContextualRecommendation(activeRegion, "topFactors").actionPhrase}
            </LinkedInsight>{" "}
            para garantir que sua equipe entregue esse valor.
          </>
        ),
        topServices: (
          <>
            Entre os serviços adicionais, "
            {simplifyLabel(data.journey.topServices[0]?.label || "N/A")}" aparece
            como o mais desejado pelos motoristas locais.
            <br />
            <br />
            Oferecer os serviços certos aumenta a percepção de valor. Aproveite esse
            dado para{" "}
            <LinkedInsight
              href={getContextualRecommendation(activeRegion, "topServices").url}
            >
              {getContextualRecommendation(activeRegion, "topServices").actionPhrase}
            </LinkedInsight>{" "}
            e atrair mais fluxo.
          </>
        ),
      }
    : ({} as any);

  const journeyDescriptions = dataExists
    ? {
        topPlacesOnTheWay: (
          <>
            O local "
            {simplifyLabel(
              data.journey.topPlacesOnTheWay[0]?.label || "N/A"
            )}
            " é a parada mais frequente na rotina dos motoristas desta região.
            <br />
            <br />
            O trajeto do seu cliente revela oportunidades de parceria. Tente{" "}
            <LinkedInsight
              href={getContextualRecommendation(
                activeRegion,
                "topPlacesOnTheWay"
              ).url}
            >
              {
                getContextualRecommendation(activeRegion, "topPlacesOnTheWay")
                  .actionPhrase
              }
            </LinkedInsight>{" "}
            com esses estabelecimentos vizinhos.
          </>
        ),
        freqGastoHeatmap: (
          <>
            Este mapa mostra onde está a maior concentration de clientes no{" "}
            {regionName} cruzando frequência e gasto.
            <br />
            <br />
            Identificar os "heavy users" é essencial para a rentabilidade. Com
            inteligência de dados, você consegue{" "}
            <LinkedInsight
              href={getContextualRecommendation(
                activeRegion,
                "freqGastoHeatmap"
              ).url}
            >
              {
                getContextualRecommendation(activeRegion, "freqGastoHeatmap")
                  .actionPhrase
              }
            </LinkedInsight>{" "}
            para campanhas exclusivas.
          </>
        ),
        freqGastoBar: (
          <>
            Detalhamento de como os gastos se distribuem por frequência de visita
            no cenário regional.
            <br />
            <br />
            Cada perfil de frequência tem um potencial de consumo distinto.
            Compreender isso permite desenhar{" "}
            <LinkedInsight
              href={getContextualRecommendation(activeRegion, "freqGastoBar").url}
            >
              {
                getContextualRecommendation(activeRegion, "freqGastoBar")
                  .actionPhrase
              }
            </LinkedInsight>{" "}
            para aumentar o ticket médio.
          </>
        ),
      }
    : ({} as any);

  const stateAnalysisDescription = (
    <>
      Esta tabela oferece uma visão comparativa detalhada dos indicadores chave,
      permitindo entender como seu estado performa em relação à média.
      <br />
      <br />
      O benchmarking regional é vital para uma gestão estratégica. Para ir além,
      acesse{" "}
      <LinkedInsight href="https://www.clubpetro.com/analise-360">
        dados exclusivos sobre o seu negócio
      </LinkedInsight>{" "}
      e compare sua performance real com o mercado.
    </>
  );

  return (
    <>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div className={`sidebar ${isSidebarOpen ? "mobile-open" : ""}`}>
        <button
          className="mobile-close-sidebar"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Fechar Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="sidebar-header">
          <img
            src="https://i.imgur.com/WkKfAI4.jpeg"
            alt="Logo"
            className="sidebar-logo"
          />
        </div>
        <ul className="sidebar-nav">
          {["Brasil", "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"].map(
            (region) => (
              <li
                key={region}
                className={`nav-item ${activeRegion === region ? "active" : ""}`}
                onClick={() => handleRegionSelect(region)}
              >
                {region}
              </li>
            )
          )}
        </ul>
        <div className="sidebar-footer">
          <a
            href="https://www.clubpetro.com/materiais"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-sub-btn"
            onClick={handleMaterialsClick}
          >
            <span>Materiais Gratuitos</span>
          </a>
          <div style={{ position: "relative" }}>
            <button
              className="sidebar-sub-btn"
              style={{ marginTop: "4px", width: "100%" }}
              onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
            >
              <span>Funcionalidades</span>
            </button>
            <div className={`features-dropdown ${isFeaturesOpen ? "open" : "closed"}`}>
              <a
                href="https://www.clubpetro.com/metas-por-ia"
                target="_blank"
                rel="noopener noreferrer"
                className="feature-link"
                onClick={() => handleFeatureClick("Metas por IA")}
              >
                Metas por IA
              </a>
              <a
                href="https://www.clubpetro.com/modulo-premios"
                target="_blank"
                rel="noopener noreferrer"
                className="feature-link"
                onClick={() => handleFeatureClick("Módulo de Prêmios")}
              >
                Módulo de Prêmios
              </a>
              <a
                href="https://www.clubpetro.com/roleta-premiada"
                target="_blank"
                rel="noopener noreferrer"
                className="feature-link"
                onClick={() => handleFeatureClick("Roleta Premiada")}
              >
                Roleta Premiada
              </a>
              <a
                href="https://www.clubpetro.com/modulo-sorteio"
                target="_blank"
                rel="noopener noreferrer"
                className="feature-link"
                onClick={() => handleFeatureClick("Módulo Sorteio")}
              >
                Módulo Sorteio
              </a>
              <a
                href="https://www.clubpetro.com/indique-e-ganhe"
                target="_blank"
                rel="noopener noreferrer"
                className="feature-link"
                onClick={() => handleFeatureClick("Indique e Ganhe")}
              >
                Indique e Ganhe
              </a>
              <a
                href="https://www.clubpetro.com/whatsapp-integrado-do-clubpetro"
                target="_blank"
                rel="noopener noreferrer"
                className="feature-link"
                onClick={() => handleFeatureClick("WhatsApp Integrado")}
              >
                WhatsApp Integrado
              </a>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', gap: '4px' }}>
              <button 
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              >
                {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                )}
              </button>

              <button
                className="logout-button"
                onClick={onLogout}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Sair
              </button>
          </div>
        </div>
      </div>
      <div className="content-wrapper">
        <header className="header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1>Hábitos de Consumo</h1>
          </div>
          <button
            className="pdf-button"
            onClick={() => executePdfGeneration()}
            disabled={isPdfGenerating}
          >
            {isPdfGenerating ? (
              "Gerando..."
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 14H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Exportar PDF
              </>
            )}
          </button>
        </header>
        <main className="main-content" ref={contentRef}>
          {loading ? (
            <>
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Panorama Geral</h2>
                </div>
                <div className="grid grid-cols-4">
                  <KpiPlaceholder />
                  <KpiPlaceholder />
                  <KpiPlaceholder />
                  <KpiPlaceholder />
                </div>
              </section>
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Adoção Digital & Pagamentos</h2>
                </div>
                <div className="grid grid-cols-1">
                  <div className="grid grid-cols-2">
                    <CardPlaceholder text="Carregando indicador..." />
                    <CardPlaceholder />
                  </div>
                </div>
              </section>
            </>
          ) : !data || data.kpis.totalRespostas === 0 ? (
            <div className="card">
              <p>
                Nenhum dado encontrado para a região selecionada. Por favor, escolha
                outra região no menu lateral.
              </p>
            </div>
          ) : (
            <>
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Panorama Geral</h2>
                </div>
                <div className="grid grid-cols-4">
                  <KpiCard
                    label="Total de Respostas"
                    value={formatNumber(data.kpis.totalRespostas)}
                    icon={<TotalResponsesIcon />}
                    description={kpiDescriptions.totalRespostas}
                  />
                  <KpiCard
                    label="Gasto Médio Dominante"
                    value={data.kpis.dominantGasto}
                    icon={<AverageSpendIcon />}
                    description={kpiDescriptions.dominantGasto}
                  />
                  <KpiCard
                    label="Nível Fidelidade Dominante"
                    value={data.kpis.dominantFidelidade}
                    icon={<FidelityLevelIcon />}
                    description={kpiDescriptions.dominantFidelidade}
                  />
                  <KpiCard
                    label="Importância da Marca (1-5)"
                    value={data.kpis.avgBrandImportance}
                    icon={<BrandImportanceIcon />}
                    description={kpiDescriptions.avgBrandImportance}
                  />
                </div>
              </section>

              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Adoção Digital & Pagamentos</h2>
                </div>
                <div className="grid grid-cols-2">
                  <GaugeChart
                    title="Pagariam por App com Desconto?"
                    value={data.kpis.percPagariamApp}
                    description={digitalDescriptions.pagariamApp}
                    onExplain={() =>
                      handleExplainChart("Pagariam por App com Desconto", "pagariamApp")
                    }
                    theme={theme}
                  />
                  <div className="card">
                    <h3>
                      Formas de Pagamento Preferidas
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart(
                            "Formas de Pagamento Preferidas",
                            "paymentMethods"
                          )
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {digitalDescriptions.paymentMethods}
                    </div>
                    {paymentMethodsChartData && (
                      <Chart
                        type="doughnut"
                        data={paymentMethodsChartData}
                        height="280px"
                        theme={theme}
                        options={{
                          cutout: "72%",
                          radius: "92%",
                          plugins: {
                            legend: { position: "right", display: true },
                            datalabels: {
                              display: true,
                              color: theme === 'dark' ? '#F8FAFC' : '#475569',
                              font: { weight: "700", size: 11 },
                              formatter: (value: number, ctx: any) => {
                                const total =
                                  ctx.chart._metasets[ctx.datasetIndex].total;
                                const percentage = (value / total) * 100;
                                return percentage > 5
                                  ? `${percentage.toFixed(0)}%`
                                  : "";
                              },
                              anchor: "center",
                              align: "center",
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </div>
              </section>

              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Comportamento e Fidelidade</h2>
                </div>
                <div className="grid grid-cols-2">
                  <div className="card">
                    <h3>
                      Formas Preferidas de Resgate de Benefícios
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart(
                            "Formas Preferidas de Resgate de Benefícios",
                            "benefitPreferences"
                          )
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {behaviorDescriptions.benefitPreferences}
                    </div>
                    {benefitPreferencesChartData && (
                      <Chart
                        type="bar"
                        data={benefitPreferencesChartData}
                        theme={theme}
                        options={{
                          plugins: {
                            legend: { display: true, position: "bottom" },
                            datalabels: {
                              display: true,
                              anchor: "end",
                              align: "start",
                              offset: 4,
                              color: theme === 'dark' ? '#F8FAFC' : "#fff",
                              font: { weight: "800" },
                            },
                          },
                          scales: {
                            y: {
                              display: true,
                              grid: { display: false },
                              ticks: { display: false },
                              border: { display: true },
                            },
                            x: {
                              display: true,
                              grid: { display: false },
                              ticks: {
                                color: theme === 'dark' ? '#CBD5E1' : "#4B5563",
                                font: { weight: "600", size: 11 },
                                autoSkip: false,
                              },
                            },
                          },
                        }}
                        height="220px"
                      />
                    )}
                  </div>
                  <div className="card">
                    <h3>
                      Nível de Fidelidade
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart("Nível de Fidelidade", "fidelityDistribution")
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {behaviorDescriptions.fidelityDistribution}
                    </div>
                    {fidelityDistributionChartData && (
                      <Chart
                        type="doughnut"
                        data={fidelityDistributionChartData}
                        theme={theme}
                        options={{
                          cutout: "68%",
                          radius: "92%",
                          plugins: {
                            legend: { position: "right", display: true },
                            datalabels: {
                              color: theme === 'dark' ? '#F8FAFC' : '#475569',
                              font: { weight: "700", size: 11 },
                              formatter: (value: number, ctx: any) => {
                                const total =
                                  ctx.chart._metasets[ctx.datasetIndex].total;
                                const percentage = (value / total) * 100;
                                return percentage > 5
                                  ? `${percentage.toFixed(0)}%`
                                  : "";
                              },
                              anchor: "center",
                              align: "center",
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                  <div className="card col-span-2">
                    <h3>
                      Frequência de Uso da Loja de Conveniência
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart(
                            "Frequência de Uso da Loja de Conveniência",
                            "convenienceUsage"
                          )
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {behaviorDescriptions.convenienceUsage}
                    </div>
                    {convenienceUsageChartData && (
                      <Chart
                        type="bar"
                        data={convenienceUsageChartData}
                        theme={theme}
                        options={{
                          indexAxis: "y",
                          plugins: {
                            legend: { display: true, position: "bottom" },
                            datalabels: {
                              color: theme === 'dark' ? '#F8FAFC' : '#fff',
                              anchor: "center",
                              align: "center",
                              font: { weight: "700", size: 11 },
                            },
                          },
                          scales: {
                            x: {
                              display: true,
                              grid: { display: false },
                              ticks: { display: false },
                              border: { display: false },
                            },
                            y: { display: true, grid: { display: false }, border: { display: false } },
                          },
                        }}
                        height="240px"
                      />
                    )}
                  </div>
                </div>
              </section>

              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Drivers de Escolha & Serviços</h2>
                </div>
                <div className="grid grid-cols-2" style={{ marginBottom: "24px" }}>
                  <KpiCard
                    label="Fator Decisivo nº 1"
                    value={
                      data.drivers.topFactors[0]
                        ? simplifyLabel(data.drivers.topFactors[0].label)
                        : "N/A"
                    }
                    icon={<TopFactorIcon />}
                    description="O principal motivo que leva o cliente a escolher o posto."
                  />
                  <KpiCard
                    label="Serviço Mais Desejado"
                    value={
                      data.journey.topServices[0]
                        ? simplifyLabel(data.journey.topServices[0].label)
                        : "N/A"
                    }
                    icon={<TopServiceIcon />}
                    description="O serviço adicional com maior interesse por parte do público."
                  />
                </div>
                <div className="grid grid-cols-1">
                  <div className="card">
                    <h3>
                      Top 5 Fatores de Escolha
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart("Top 5 Fatores de Escolha", "topFactors")
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {driversDescriptions.topFactors}
                    </div>
                    {topFactorsChartData && (
                      <Chart
                        type="bar"
                        data={topFactorsChartData}
                        theme={theme}
                        options={{
                          indexAxis: "y",
                          plugins: {
                            legend: { display: true, position: "bottom" },
                            datalabels: {
                              display: true,
                              anchor: "end",
                              align: "start",
                              offset: 4,
                              color: theme === 'dark' ? '#F8FAFC' : '#fff',
                              font: { weight: "800" },
                            },
                          },
                          scales: {
                            x: {
                              display: true,
                              grid: { display: false },
                              ticks: { display: false },
                            },
                            y: {
                              display: true,
                              grid: { display: false },
                              ticks: {
                                color: theme === 'dark' ? '#CBD5E1' : "#4B5563",
                                font: { weight: "600", size: 11 },
                                autoSkip: false,
                                mirror: false,
                              },
                              border: { display: false },
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                  <div className="card">
                    <h3>
                      Top 5 Serviços Desejados
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart("Top 5 Serviços Desejados", "topServices")
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {driversDescriptions.topServices}
                    </div>
                    {topServicesChartData && (
                      <Chart
                        type="bar"
                        data={topServicesChartData}
                        theme={theme}
                        options={{
                          indexAxis: "y",
                          plugins: {
                            legend: { display: true, position: "bottom" },
                            datalabels: {
                              anchor: "end",
                              align: "start",
                              offset: 4,
                              color: theme === 'dark' ? '#F8FAFC' : '#fff',
                              font: { weight: "800" },
                            },
                          },
                          scales: {
                            y: {
                              display: true,
                              grid: { display: false },
                              ticks: {
                                display: true,
                                color: theme === 'dark' ? '#CBD5E1' : "#4B5563",
                                font: { weight: "600", size: 11 },
                                autoSkip: false,
                                mirror: false,
                              },
                              border: { display: false },
                            },
                            x: { display: false, grid: { display: false } },
                          },
                        }}
                      />
                    )}
                  </div>
                </div>
              </section>

              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Jornada & Consumo</h2>
                </div>
                <div className="grid grid-cols-2">
                  <div className="card">
                    <h3>
                      Principais Locais no Caminho
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart(
                            "Principais Locais no Caminho",
                            "topPlacesOnTheWay"
                          )
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {journeyDescriptions.topPlacesOnTheWay}
                    </div>
                    {topPlacesChartData && (
                      <Chart
                        type="radar"
                        data={topPlacesChartData}
                        height="320px"
                        theme={theme}
                        options={{
                          plugins: {
                            legend: { display: false },
                            datalabels: { display: false },
                          },
                          elements: {
                            line: { borderWidth: 2, fill: true },
                            point: { radius: 3, hoverRadius: 5, backgroundColor: '#fff' },
                          },
                          scales: {
                            r: {
                              grid: {
                                display: true,
                                circular: true,
                                color: theme === 'dark' ? 'rgba(51, 65, 85, 0.5)' : "rgba(226, 232, 240, 0.8)",
                              },
                              angleLines: { display: true, color: theme === 'dark' ? 'rgba(51, 65, 85, 0.4)' : "rgba(226, 232, 240, 0.6)" },
                              ticks: { display: false, backdropColor: "transparent" },
                              pointLabels: {
                                color: theme === 'dark' ? '#CBD5E1' : "#475569",
                                font: { weight: '600', size: 10 },
                                padding: 12,
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                  <HeatmapChart
                    title="Frequência vs Gasto Médio"
                    data={data.consumption.freqGasto}
                    gastoLabels={gastoLabels}
                    freqLabels={freqLabels}
                    description={journeyDescriptions.freqGastoHeatmap}
                    onExplain={() =>
                      handleExplainChart("Frequência vs Gasto Médio", "freqGastoHeatmap")
                    }
                    theme={theme}
                  />
                  <div className="card col-span-2">
                    <h3>
                      Distribuição de Gasto por Frequência
                      <ExplainButton
                        onClick={() =>
                          handleExplainChart(
                            "Distribuição de Gasto por Frequência",
                            "freqGastoBar"
                          )
                        }
                      />
                    </h3>
                    <div className="card-description">
                      {journeyDescriptions.freqGastoBar}
                    </div>
                    <Chart
                      type="bar"
                      data={freqGastoBarData}
                      theme={theme}
                      options={{
                        scales: {
                          x: { display: true, stacked: false, grid: { display: false }, border: { display: false } },
                          y: {
                            display: true,
                            stacked: false,
                            border: { display: false },
                          },
                          y1: { display: false, position: "right", beginAtZero: true },
                        },
                        plugins: {
                          legend: { position: "top", display: true },
                          datalabels: { display: false },
                        },
                      }}
                      height="300px"
                    />
                  </div>
                </div>
              </section>

              <section className="dashboard-section">
                <div className="section-header">
                  <h2>Análise Detalhada por Estado</h2>
                  <button
                    className="csv-export-button"
                    onClick={handleExportCsv}
                    title="Exportar dados da tabela para CSV"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Exportar CSV
                  </button>
                </div>
                <div className="card">
                  <div
                    className="card-description"
                    style={{ marginTop: 0, marginBottom: "24px" }}
                  >
                    {stateAnalysisDescription}
                  </div>
                  <div className="table-container">
                    <table className="detailed-table">
                      <thead>
                        <tr>
                          {tableHeaders.map(({ key, label }) => (
                            <th
                              key={key}
                              onClick={() => key !== "rank" && requestSort(key)}
                              style={{
                                cursor: key === "rank" ? "default" : "pointer",
                              }}
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedStateAnalysis.map((stateData: any) => (
                          <tr key={stateData.state}>
                            <td>
                              <span
                                className={`rank-badge ${
                                  stateData.rank <= 3 ? "top-3" : ""
                                }`}
                              >
                                {stateData.rank}
                              </span>
                            </td>
                            <td>
                              <strong>{stateData.state}</strong>
                            </td>
                            <td style={{ color: "var(--subtle-text-color)" }}>
                              {stateData.region}
                            </td>
                            <td>
                              <div className="response-cell">
                                <span className="response-val">
                                  {formatNumber(stateData.responses)}
                                </span>
                                <div className="response-bar-track">
                                  <div
                                    className="response-bar-fill"
                                    style={{
                                      width: `${
                                        (stateData.responses / maxResponses) * 100
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-badge">
                                {stateData.dominantGasto}
                              </span>
                            </td>
                            <td>
                              <span className="text-badge">
                                {stateData.dominantFreq}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
        {!loading && data && (
          <RicardoAssistant
            ref={ricardoRef}
            dashboardData={data}
            userName={userName}
            userRegion={activeRegion}
            onLinkClick={handleRicardoLinkClick}
          />
        )}
        {isPdfModalOpen && (
          <PdfExportModal
            onSelect={handlePdfRegionSelect}
            onClose={() => setIsPdfModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

// -----------------------------------------------------------------------------
// LOGIN
// -----------------------------------------------------------------------------

const LoginPage = ({
  onLoginSuccess,
}: {
  onLoginSuccess: (name: string, id: number) => void;
}) => {
  const [formData, setFormData] = useState({
    Nome: "",
    Telefone: "",
    Email: "",
    Cnpj: "",
    Relação: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, "");
    return v
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2")
      .substring(0, 15);
  };

  const formatCNPJ = (value: string) => {
    const v = value.replace(/\D/g, "");
    return v
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "Telefone") {
      newValue = formatPhone(value);
    } else if (name === "Cnpj") {
      newValue = formatCNPJ(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setError("Falha na conexão com o banco de dados. Verifique a configuração.");
      return;
    }

    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(formData.Nome)) {
      setError("O nome deve conter apenas letras e espaços.");
      return;
    }
    if (
      !formData.Nome ||
      !formData.Email ||
      !formData.Telefone ||
      !formData.Cnpj ||
      !formData.Relação
    ) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    const cleanCnpj = formData.Cnpj.replace(/\D/g, "");
    if (cleanCnpj.length < 14) {
      setError("CNPJ inválido. Verifique se digitou corretamente.");
      return;
    }
    const cleanPhone = formData.Telefone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Telefone inválido. Verifique se digitou corretamente.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const { data: existingUser, error: searchError } = await supabase
        .from("Login_Habitos_2025")
        .select("id, Nome")
        .or(`Email.eq.${formData.Email},Cnpj.eq.${cleanCnpj}`)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingUser) {
        onLoginSuccess(existingUser.Nome, existingUser.id);
        return;
      }

      const payload = {
        Nome: formData.Nome,
        Email: formData.Email,
        Telefone: cleanPhone
          ? Number(cleanPhone)
          : null,
        Cnpj: cleanCnpj,
        Relacao: formData.Relação,
      };

      const { data, error: insertError } = await supabase
        .from("Login_Habitos_2025")
        .insert([payload])
        .select();

      if (insertError) throw insertError;

      const createdId = data?.[0]?.id;
      onLoginSuccess(formData.Nome, createdId);
    } catch (err: any) {
      console.error("Error during login:", err);
      const msg = err.message || "Erro desconhecido";
      setError(`Não foi possível acessar. ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const relationOptions = [
    { value: "Dono(a) ou Diretor(a)", label: "Dono(a) ou Diretor(a)" },
    { value: "Gerente ou Supervisor(a)", label: "Gerente ou Supervisor(a)" },
    { value: "Frentista", label: "Frentista" },
    { value: "Sou cliente de um Posto", label: "Sou cliente de um Posto" },
    { value: "Presto serviços para Postos", label: "Presto serviços para Postos" },
    { value: "Outra relação", label: "Outra relação" },
    { value: "Não se aplica", label: "Não se aplica" },
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-promo">
          <h2>Entenda os Hábitos de Consumo dos seus motoristas</h2>
          <img
            src="https://i.imgur.com/ePbjSL9.jpeg"
            alt="Mapa do Brasil"
            className="promo-map-image"
          />
          <p>
            Acesse nossa plataforma exclusiva e descubra como os motoristas da sua
            região se comportam para alavancar seus resultados.
          </p>
        </div>
        <div className="login-form-container">
          <img
            src="https://i.imgur.com/N6HZDNW.jpeg"
            alt="Clubpetro Logo"
            className="form-logo"
          />
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="Nome">Seu Nome Completo</label>
                <input
                  type="text"
                  id="Nome"
                  name="Nome"
                  className="form-input"
                  value={formData.Nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Email">E-mail Corporativo</label>
                <input
                  type="email"
                  id="Email"
                  name="Email"
                  className="form-input"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  placeholder="Ex: joao@email.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Telefone">Telefone de Contato</label>
                <input
                  type="tel"
                  id="Telefone"
                  name="Telefone"
                  className="form-input"
                  value={formData.Telefone}
                  onChange={handleChange}
                  required
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Cnpj">CNPJ do Posto</label>
                <input
                  type="text"
                  id="Cnpj"
                  name="Cnpj"
                  className="form-input"
                  value={formData.Cnpj}
                  onChange={handleChange}
                  required
                  maxLength={18}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Relação">Sua Relação com o Posto</label>
                <select
                  id="Relação"
                  name="Relação"
                  className="form-select"
                  value={formData.Relação}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione...</option>
                  {relationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={isSubmitting}>
              {isSubmitting ? "Acessando..." : "Acessar Painel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const App = () => {
  const [user, setUser] = useState<{ name: string; id: number } | null>(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  if (!user) {
    return (
      <>
        <style>{AppStyles}</style>
        <LoginPage onLoginSuccess={(name, id) => setUser({ name, id })} />
      </>
    );
  }

  return (
    <>
      <style>{AppStyles}</style>
      <Dashboard
        onLogout={() => setUser(null)}
        userName={user.name}
        userId={user.id}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </>
  );
};

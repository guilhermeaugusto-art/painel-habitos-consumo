import React from 'react';

export type DashboardData = {
    kpis: {
        totalRespostas: number;
        percPagariamApp: number;
        avgBrandImportance: string;
        dominantGasto: string;
        dominantFidelidade: string;
    };
    distribution: {
        byRegionState: { label: string; value: number; region: string; }[];
    };
    consumption: {
        freqGasto: Record<string, Record<string, number>>;
    };
    digital: {
        paymentMethods: { label: string; value: number }[];
    };
    drivers: {
        topFactors: { label: string; value: number }[];
    };
    journey: {
        topServices: { label: string; value: number }[];
        topPlacesOnTheWay: { label: string; value: number }[];
    };
    behavior: {
        convenienceUsage: { label: string; value: number }[];
        benefitPreferences: { label: string; value: number }[];
        fidelityDistribution: { label: string; value: number }[];
    };
    detailedStateAnalysis: {
        state: string;
        region: string;
        responses: number;
        dominantGasto: string;
        dominantFreq: string;
    }[];
};

export interface AiMessage {
  id: number;
  text: string;
  sender: 'user' | 'ricardo';
  linkTitle?: string;
  linkUrl?: string;
  suggestions?: string[];
}

export interface RicardoAssistantHandle {
    askQuestion: (question: string, chartKey: string) => void;
}

export type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};
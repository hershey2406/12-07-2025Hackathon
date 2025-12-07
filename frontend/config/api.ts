// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  health: '/health',
  news: '/news',
  fetch: '/fetch',
  today: '/today',
  todayList: '/today/list',
  todaySummary: '/today/summary',
  ask: '/ask',
  todayEconomy: '/today/economy',
  todayHealth: '/today/health',
  todayDefense: '/today/defense',
  todayEconomyTop3: '/today/economy/top3',
  todayHealthTop3: '/today/health/top3',
  todayDefenseTop3: '/today/defense/top3',
  articleSummary: '/article/summary',
} as const;
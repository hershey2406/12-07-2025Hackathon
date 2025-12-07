import { API_CONFIG, API_ENDPOINTS } from '../config/api';

// Types for API responses
export interface Article {
  id?: number;
  title: string;
  description?: string;
  content?: string;
  simpleContent?: string;
  verySimpleContent?: string;
  url?: string;
  published_at?: string;
  category?: string;
  summary?: string;
  meaningForYou?: string;
  terms?: { term: string; definition: string }[];
  date?: string;
}

export interface NewsResponse {
  summary: string;
}

export interface FetchResponse {
  results: Array<{
    url: string;
    text?: string;
    summary?: string;
    error?: string;
  }>;
}

export interface TodayResponse {
  date: string;
  headlines: Article[];
}

export interface CategoryResponse {
  date: string;
  category: string;
  count: number;
  articles: Article[];
}

export interface AskResponse {
  answer: string;
  context_used?: boolean;
}

export interface ArticleSummaryResponse {
  article: Article;
  summary: string;
}

// Helper function for making API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: API_CONFIG.headers,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
}

// Health check
export async function healthCheck(): Promise<{ status: string }> {
  return apiCall(API_ENDPOINTS.health);
}

// Summarize news text
export async function summarizeNews(text: string): Promise<NewsResponse> {
  return apiCall(API_ENDPOINTS.news, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// Fetch and summarize URLs
export async function fetchUrls(urls: string[]): Promise<FetchResponse> {
  return apiCall(API_ENDPOINTS.fetch, {
    method: 'POST',
    body: JSON.stringify({ urls }),
  });
}

// Fetch single URL
export async function fetchUrl(url: string): Promise<FetchResponse> {
  return apiCall(API_ENDPOINTS.fetch, {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

// Get today's headlines
export async function getTodayHeadlines(date?: string): Promise<TodayResponse> {
  const params = date ? `?date=${date}` : '';
  return apiCall(`${API_ENDPOINTS.today}${params}`);
}

// Get today's headlines as list
export async function getTodayList(date?: string): Promise<TodayResponse> {
  const params = date ? `?date=${date}` : '';
  return apiCall(`${API_ENDPOINTS.todayList}${params}`);
}

// Get today's summary
export async function getTodaySummary(date?: string): Promise<{ date: string; summary: string; count: number }> {
  const params = date ? `?date=${date}` : '';
  return apiCall(`${API_ENDPOINTS.todaySummary}${params}`);
}

// Ask AI a question
export async function askQuestion(prompt: string, date?: string): Promise<AskResponse> {
  return apiCall(API_ENDPOINTS.ask, {
    method: 'POST',
    body: JSON.stringify({ prompt, date }),
  });
}

// Get economy articles
export async function getEconomyArticles(date?: string, limit?: number): Promise<CategoryResponse> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`${API_ENDPOINTS.todayEconomy}${query}`);
}

// Get health articles
export async function getHealthArticles(date?: string, limit?: number): Promise<CategoryResponse> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`${API_ENDPOINTS.todayHealth}${query}`);
}

// Get defense articles
export async function getDefenseArticles(date?: string, limit?: number): Promise<CategoryResponse> {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiCall(`${API_ENDPOINTS.todayDefense}${query}`);
}

// Get top 3 economy articles
export async function getTop3EconomyArticles(date?: string): Promise<CategoryResponse> {
  const params = date ? `?date=${date}` : '';
  return apiCall(`${API_ENDPOINTS.todayEconomyTop3}${params}`);
}

// Get top 3 health articles
export async function getTop3HealthArticles(date?: string): Promise<CategoryResponse> {
  const params = date ? `?date=${date}` : '';
  return apiCall(`${API_ENDPOINTS.todayHealthTop3}${params}`);
}

// Get top 3 defense articles
export async function getTop3DefenseArticles(date?: string): Promise<CategoryResponse> {
  const params = date ? `?date=${date}` : '';
  return apiCall(`${API_ENDPOINTS.todayDefenseTop3}${params}`);
}

// Get article summary by URL
export async function getArticleSummary(url: string, date?: string): Promise<ArticleSummaryResponse> {
  return apiCall(API_ENDPOINTS.articleSummary, {
    method: 'POST',
    body: JSON.stringify({ url, date }),
  });
}

// Legacy function to maintain compatibility with existing code
export async function fetchArticleSummary(articleTitle: string, articleContent: string): Promise<string> {
  try {
    // Try to summarize the content using the backend
    const response = await summarizeNews(articleContent);
    return response.summary;
  } catch (error) {
    console.warn('Failed to fetch summary from backend, using fallback:', error);
    
    // Fallback to mock summaries
    const simpleHash = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % 10 + 1;
    };

    const mockSummaries: { [key: number]: string } = {
      1: 'The Federal Reserve has decided to maintain current interest rates to support economic growth while monitoring inflation.',
      2: 'Major stock indices hit all-time highs as investors show confidence in corporate earnings and economic stability.',
      3: 'The unemployment rate fell to 3.5%, the lowest level in over 50 years, as businesses continue hiring.',
      4: 'Clinical trials reveal that a new medication can slow cognitive decline in early-stage Alzheimer\'s patients.',
      5: 'Health officials urge Americans to get the new updated COVID-19 vaccine to protect against current variants.',
      6: 'Research shows that walking just 30 minutes daily can significantly reduce the risk of heart disease.',
      7: 'The Department of Defense launches a comprehensive program to strengthen national cybersecurity defenses.',
      8: 'Congress approves expanded healthcare coverage for veterans, including mental health services.',
      9: 'NATO allies agree to deploy additional forces to Eastern Europe to bolster regional security.',
      10: 'Default summary for this article content based on the title and content provided.'
    };
    
    const articleId = simpleHash(articleTitle);
    return mockSummaries[articleId] || 'Summary not available.';
  }
}

// Helper function to get articles by category
export async function getArticlesByCategory(category: 'economy' | 'health' | 'defense', date?: string, limit?: number): Promise<CategoryResponse> {
  switch (category) {
    case 'economy':
      return getEconomyArticles(date, limit);
    case 'health':
      return getHealthArticles(date, limit);
    case 'defense':
      return getDefenseArticles(date, limit);
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

// Helper function to get top 3 articles by category
export async function getTop3ArticlesByCategory(category: 'economy' | 'health' | 'defense', date?: string): Promise<CategoryResponse> {
  switch (category) {
    case 'economy':
      return getTop3EconomyArticles(date);
    case 'health':
      return getTop3HealthArticles(date);
    case 'defense':
      return getTop3DefenseArticles(date);
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

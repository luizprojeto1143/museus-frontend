export interface Pagination {
  total: number;
  pages: number;
  current: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: Pagination;
  message?: string;
  success?: boolean;
}

export interface City {
  id: string;
  name: string;
  state: string;
  coverUrl?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalMuseums?: number;
  totalEvents?: number;
}

export interface Museum {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  cityId: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Work {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  description?: string;
  imageUrl?: string;
  museumId: string;
  audioUrl?: string;
  librasUrl?: string;
  location?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverUrl?: string;
  cityId?: string;
  museumId?: string;
}

export interface Trail {
  id: string;
  name: string;
  description?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedMinutes?: number;
  points: number;
  cityId?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  requiredPoints?: number;
}

export interface VisitorProfile {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  avatarUrl?: string;
}

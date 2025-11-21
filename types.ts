export interface Game {
  id: string;
  title: string;
  description: string; // Maps to 'info' from API
  price: number;
  imageUrl: string; // Maps to 'image' from API
  category: string;
  rating: number;
  releaseDate: string;
}

export enum ViewState {
  STORE = 'STORE',
  CART = 'CART'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}
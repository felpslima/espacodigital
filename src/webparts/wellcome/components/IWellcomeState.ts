import { IFavoriteItem } from './IFavoriteItem';

export interface IWellcomeState {
  userName: string;
  userPhoto: string;
  favorites: IFavoriteItem[];
  isLoading: boolean;
  containerWidth: number;
} 
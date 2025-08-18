import { Restaurant } from './tree';
import {RootState, AppDispatch} from '../redux/store';

export type SavedRestaurantType = {
  id: string;
  name: string;
};

export type SavedSeedType = {
  seedId: number;
  name: string;
};


export type PlantingStackParamList = {
  PlantHome:
  | { savedRestaurant?: SavedRestaurantType; savedSeed?: SavedSeedType;  }
    | undefined;
  PlantSearch: undefined;
  PlantSelection: { initialParam?: number; savedSeedId?: number }; // <-- Add selectedSeedId here
  TagSelection: { initialParam?: number;}
};


export type SeedPlantingState = {
  restaurantQuery: string;
  savedRestaurant: SavedRestaurantType | null;
  savedSeed: SavedSeedType | null;
  savedTags: string[]; // 태그는 문자열 배열이라고 가정
  savedPhotos: string[]; 
  reviewText: string;
};

export type {RootState, AppDispatch};

import {RootState, AppDispatch} from '../redux/store';

export type SeedType = {
  id: number;
  name: string;
  image: any; // 이미지 경로 타입에 따라 더 구체적으로 정의할 수 있습니다.
};

export type PlantingStackParamList = {
  PlantHome: {selectedPlace?: string; selectedSeed?: SeedType} | undefined;
  PlantSearch: undefined;

  PlantSelection: {initialParam?: number; selectedSeedId?: number}; // <-- Add selectedSeedId here
};

export type PlaceType = {
  id: string;
  name: string;
  address: string;
  // 필요한 다른 장소 속성 추가
};

export type SeedPlantingState = {
  locationQuery: string;
  selectedLocation: PlaceType | null;
  selectedSeed: SeedType | null;
  selectedTags: string[]; // 태그는 문자열 배열이라고 가정
  selectedPhotos: string[]; // 사진 URI는 문자열 배열이라고 가정
  reviewText: string;
};

export type {RootState, AppDispatch};

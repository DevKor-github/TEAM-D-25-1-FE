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

import {createSlice} from '@reduxjs/toolkit';
import {SeedPlantingState} from '../types/types';

const initialState: SeedPlantingState = {
  locationQuery: '',
  selectedLocation: null,
  selectedSeed: null,
  selectedTags: [],
  selectedPhotos: [], // 이미지 URI 배열
  reviewText: '',
};

const seedPlantingSlice = createSlice({
  name: 'seedPlanting',
  initialState,
  reducers: {
    // 장소 검색 TextInput 값 업데이트
    setLocationQuery: (state, action) => {
      state.locationQuery = action.payload;
    },
    // 선택된 장소 업데이트 (예: 장소 검색 결과에서 선택)
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
      state.locationQuery = action.payload ? action.payload.name : ''; // 선택된 장소 이름으로 쿼리 업데이트
    },
    // 선택된 씨앗 업데이트
    setSelectedSeed: (state, action) => {
      state.selectedSeed = action.payload;
    },
    // 태그 추가
    addTag: (state, action) => {
      if (!state.selectedTags.includes(action.payload)) {
        state.selectedTags.push(action.payload);
      }
    },
    // 태그 제거
    removeTag: (state, action) => {
      state.selectedTags = state.selectedTags.filter(
        tag => tag !== action.payload,
      );
    },
    // 사진 추가
    addPhoto: (state, action) => {
      state.selectedPhotos.push(action.payload);
    },
    // 사진 제거
    removePhoto: (state, action) => {
      state.selectedPhotos = state.selectedPhotos.filter(
        uri => uri !== action.payload,
      );
    },
    // 한줄평 TextInput 값 업데이트
    setReviewText: (state, action) => {
      state.reviewText = action.payload;
    },
    // 모든 상태 초기화
    resetSeedPlanting: state => {
      // Immer가 불변성 관리를 해주므로 직접 할당해도 안전합니다.
      Object.assign(state, initialState);
    },
  },
});

export const {
  setLocationQuery,
  setSelectedLocation,
  setSelectedSeed,
  addTag,
  removeTag,
  addPhoto,
  removePhoto,
  setReviewText,
  resetSeedPlanting,
} = seedPlantingSlice.actions;

export default seedPlantingSlice.reducer;

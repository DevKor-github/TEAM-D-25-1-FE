import {createSlice} from '@reduxjs/toolkit';
import {SeedPlantingState} from '../types/types';

const initialState: SeedPlantingState = {
  restaurantQuery: '',
  savedRestaurant: null,
  savedSeed: null,
  savedTags: [],
  savedPhotos: [], 
  reviewText: '',
};

const seedPlantingSlice = createSlice({
  name: 'seedPlanting',
  initialState,
  reducers: {
    // 장소 검색 TextInput 값 업데이트
    setRestaurantQuery: (state, action) => {
      state.restaurantQuery = action.payload;
    },
    // 선택된 장소 업데이트 (예: 장소 검색 결과에서 선택)
    setSavedRestaurant: (state, action) => {
      state.savedRestaurant = action.payload;
      state.restaurantQuery = action.payload ? action.payload.name : ''; // 선택된 장소 이름으로 쿼리 업데이트
    },
    // 선택된 씨앗 업데이트
    setSavedSeed: (state, action) => {
      state.savedSeed = action.payload;
    },
    // 선택한 태그
    setSavedTags: (state, action) => {
      state.savedTags = action.payload;
    },
    // 태그 추가
    addTag: (state, action) => {
      if (!state.savedTags.includes(action.payload)) {
        state.savedTags.push(action.payload);
      }
    },
    // 태그 제거
    removeTag: (state, action) => {
      state.savedTags = state.savedTags.filter(tag => tag !== action.payload);
    },
    // 사진 추가
    addPhoto: (state, action) => {
      state.savedPhotos.push(action.payload);
    },
    // 사진 제거
    removePhoto: (state, action) => {
      state.savedPhotos = state.savedPhotos.filter(
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
  setRestaurantQuery,
  setSavedRestaurant,
  setSavedSeed,
  setSavedTags,
  addTag,
  removeTag,
  addPhoto,
  removePhoto,
  setReviewText,
  resetSeedPlanting,
} = seedPlantingSlice.actions;

export default seedPlantingSlice.reducer;

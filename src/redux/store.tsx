import {configureStore} from '@reduxjs/toolkit';
import seedPlantingReducer from './seedPlantingSlice';

export const store = configureStore({
  reducer: {
    seedPlanting: seedPlantingReducer,
  },
});

// RootState 타입을 정의하고 export 합니다.
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch 타입을 정의하고 export 합니다.
export type AppDispatch = typeof store.dispatch;

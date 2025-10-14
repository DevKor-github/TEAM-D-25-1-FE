// src/apis/api/search.ts
import { defaultInstance } from '../utils/axios';
import { getSearchUsersList, getSearchRestaurantsList } from '../services/search';

/** ───── 검색: 유저 ───── */
export const getSearchUsers = async (query: string) => {
  try {
    const { data } = await defaultInstance.get('/search/users', { params: { query } });
    console.log('유저 검색 가져오기');
    console.log(data.items);
    return getSearchUsersList(data.items);
  } catch (error) {
    console.log('유저 검색 가져오기 실패', error);
    return error;
  }
};

/** ───── 검색: 식당(목록) ───── */
export const getSearchRestaurants = async (query: string) => {
  try {
    const { data } = await defaultInstance.get('/search/restaurants', { params: { query } });
    console.log('식당 검색 가져오기');
    console.log(query);
    console.log(data.items);
    return getSearchRestaurantsList(data.items);
  } catch (error) {
    console.log('식당 검색 가져오기 실패', error);
    return error;
  }
};

/** ───── 식당 상세 타입 ───── */
export type RestaurantDetail = {
  id: string;
  name: string;
  address: string;
  placeId: string;
  createdAt: string;
  lat: number; // ✅ 숫자
  lng: number; // ✅ 숫자 (longitude를 lng로 표준화)
};

/** ───── 식당 상세: /restaurant/{restaurantId} ───── */
export const getRestaurantDetail = async (restaurantId: string): Promise<RestaurantDetail> => {
  try {
    const { data } = await defaultInstance.get(`/restaurant/${restaurantId}`);
    console.log('식당 디테일 가져오기:', data);

    // 서버는 latitude/longitude를 문자열로 줄 수 있음 → 숫자 변환
    const lat = parseFloat(String(data?.latitude));
    const lng = parseFloat(String(data?.longitude));

    return {
      id: String(data?.id ?? ''),
      name: String(data?.name ?? ''),
      address: String(data?.address ?? ''),
      placeId: String(data?.placeId ?? ''),
      createdAt: String(data?.createdAt ?? ''),
      lat,
      lng,
    };
  } catch (error) {
    console.log('식당 디테일 가져오기 실패', error);
    throw error;
  }
};

export const getTag = async () => {
  try {
    const { data } = await defaultInstance.get('/settings');
    return data;
  } catch (error: any) {
    console.log('[getTag] error', {
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

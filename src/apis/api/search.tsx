import {getSearchUsersList, getSearchRestaurantsList} from '../services/search';
import { defaultInstance } from '../utils/axios';


export const getSearchUsers = async (
  query: string,
  page: number,
  per_page: number,
) => {
  try {
    const {data} = await defaultInstance.get('/search/users', {
      params: {
        query: query,
        page: page,
        per_page: per_page,
      },
    });
    console.log('유저 검색 가져오기');
    console.log(data.items);

    return getSearchUsersList(data.items);
  } catch (error) {
    console.log('유저 검색 가져오기 실패');
    console.log(error);
    return error;
  }
};


export const getSearchRestaurants = async (
  query: string,
) => {
  try {
    const {data} = await defaultInstance.get('/search/restaurants', {
      params: {
        query: query,
      },
    });
    console.log('식당 검색 가져오기');
    console.log(query)
    console.log(data.items);

    return getSearchRestaurantsList(data.items);
  } catch (error) {
    console.log('식당 검색 가져오기 실패');
    console.log(error);
    return error;
  }
};

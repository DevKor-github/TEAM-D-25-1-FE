import {getRestaurantList} from '../services/restaurant';
import {defaultInstance} from '../utils/axios';

export const getRestaruant = async () => {
  try {
    const {data} = await defaultInstance.get('/users/me/restaurants');
    return getRestaurantList(data.items);
  } catch (error) {
    return error;
  }
};

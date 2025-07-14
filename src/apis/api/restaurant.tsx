import {getTreeList} from '../services/restaurant';
import {defaultInstance} from '../utils/axios';

export const getTree = async (lon: string, lat: string) => {
  try {
    const {data} = await defaultInstance.get('/users/me/restaurants',{
      // params: {
      //   lon: lon,
      //   lat: lat,
      // },
    });
    return getTreeList(data.items);
  } catch (error) {
    return error;
  }
};


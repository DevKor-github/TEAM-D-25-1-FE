import {getTreeList} from '../services/restaurant';
import { defaultInstance } from '../utils/axios';



export const getTree = async (lon: string, lat: string, idToken: string) => {
  try {
    
    const {data} = await defaultInstance.get('/tree', {
      params: {
        lon: lon,
        lat: lat,
      },
      headers: {
        Authorization: `Bearer ${idToken}`, // ✅ 여기 추가
      },
    });
    return getTreeList(data.items);
  } catch (error) {
    return error;
  }
};


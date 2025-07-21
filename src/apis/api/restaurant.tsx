import {getTreeList} from '../services/restaurant';
import { defaultInstance } from '../utils/axios';



export const getTree = async (lon: string, lat: string) => {
  try {
    
    const {data} = await defaultInstance.get('/tree', {
      params: {
        lon: lon,
        lat: lat,
      },
    });
    console.log("트리 가져오기");
    console.log(data.items);
    
    return getTreeList(data.items);
  } catch (error) {
    console.log(error);
    return error;
  }
};


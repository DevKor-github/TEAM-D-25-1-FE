import {getTreeList} from '../services/tree';
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

export const postTree = async (
  treeType : number,
  restaurantId: string,
  review: string,
  description: string,
  tags: string[],
) => {
  
  try {
    console.log('씨앗을 심어보자');
    const payload = {
      treeType: treeType,
      restaurantId: restaurantId,
      review: review,
      description: description,
      tags: tags,
    };
    console.log(payload);
    console.log('보낼 payload:', payload);
    

    // POST 요청을 보낼 엔드포인트는 '/tree'로 가정합니다.
    // 실제 API 명세에 따라 엔드포인트를 조정해주세요.
    const response = await defaultInstance.post('/tree', payload);
    console.log('씨앗 심기 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      '씨앗 심기 실패:',
      error,
    );
    throw error; // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록 합니다.
  }
};

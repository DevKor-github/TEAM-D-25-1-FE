
import { defaultInstance } from '../utils/axios';


export const getUser = async () => {
  try {
    
    const {data} = await defaultInstance.get('/users/me');
    console.log("유저 가져오기");
    console.log(data);
    
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const patchNickname = async (nickname: string) => {
    try {
      const {data} = await defaultInstance.patch('/users/me', {
        nickname: nickname,
      });
      console.log('유저 가져오기');
      console.log(data);

      return data;
    } catch (error) {
      console.log(error);
      return error;
    }
}

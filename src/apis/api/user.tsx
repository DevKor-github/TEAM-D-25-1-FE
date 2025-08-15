
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

export const getFollower = async (userId: string) => {
  try {
    const {data} = await defaultInstance.get(`/users/profile/${userId}`);
    console.log('팔로잉할 유저 가져오기');
    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const followUser = async (userId: string) => {
  try {
    const {data} = await defaultInstance.post(`/users/${userId}/follow`);
    console.log('팔로잉!!');
    console.log(data);

  } catch (error) {
    console.log(error);
    return error;
  }
};

export const unfollowUser = async (userId: string) => {
  try {
    const {data} = await defaultInstance.post(`/users/${userId}/unfollow`);
    console.log('언팔!!');
    console.log(data);

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

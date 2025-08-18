
import { defaultInstance } from '../utils/axios';
export type UserSummary = {
  id: string;
  username: string;
  nickname: string;
  email: string;
  socialProvider: string;
  socialId: string;
  isPrivate: boolean;
  createdAt: string;
};

type UserListResponse = { items: UserSummary[] };



export const getUser = async () => {
  try {
    
    const {data} = await defaultInstance.get('/users/me/mypage');
    console.log("유저 가져오기");
    console.log(data);
    
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const getMyTree = async () => {
  try {
    const { data } = await defaultInstance.get('/users/me/restaurants');
    console.log('내가 심은 나무 가져오기');
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
        const { data } = await defaultInstance.post(`/users/${userId}/unfollow`);
        console.log('언팔!!');
        console.log(data);
    } catch (error) {
    console.log(error);
    return error;
  }
}
export const getFollowingList = async (userId: string): Promise<UserSummary[]> => {
  const { data } = await defaultInstance.get<UserListResponse>(`/users/${userId}/following`);
  // 필요하면 pagination: defaultInstance.get(..., { params: { page, size } })
  return data.items;
};

export const getFollwerList = async () => {
    try {
    
    const {data} = await defaultInstance.get('/users/me/followers');
    console.log("팔로워 가져오기");
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

export const getUserFollowStatus = async (userId: string) => {
  try {
    const {data} = await defaultInstance.get(`/users/${userId}/follow-status`);
    console.log('유저 팔로우 상태 가져오기');
    console.log(data);

    return data;
  } catch (error) {
    console.log('유저 팔로우 상태 가져오기 실패');
    console.log(error);
    return error;
  }
};

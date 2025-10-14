// file: src/apis/api/user.ts
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

// ✅ 코어 유저(프로필 이미지/한줄소개 등은 여기서 가장 신뢰)
export const getMe = async () => {
  try {
    const { data } = await defaultInstance.get('/users/me', {
      headers: { 'Cache-Control': 'no-cache' }, // 최신값 강제
    });
    return data;
  } catch (error) {
    console.log('[getMe] error', error);
    return error;
  }
};

// (이 함수는 마이페이지 집계용: 트리/팔로워/리캡 등)
export const getMyPage = async () => {
  try {
    const { data } = await defaultInstance.get('/users/me/mypage', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    return data;
  } catch (error: any) {
    console.log('[getMyPage] error', {
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

// === 기존 함수들 (필요분 유지) ===

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
};

export const getFollowingList = async (userId: string): Promise<UserSummary[]> => {
  const { data } = await defaultInstance.get<UserListResponse>(`/users/${userId}/following`);
  return data.items;
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

export const patchMyPreference = async (payload: { mbti: string | null; tags: string[] }) => {
  const url = '/users/me/preferences';
  try {
    const { data } = await defaultInstance.patch(url, payload);
    return data;
  } catch (error: any) {
    console.log('[patchMyPreference] error', {
      url,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
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
export const getFollwingList = async () => {
  try {
    const {data} = await defaultInstance.get('/users/me/following');
    console.log("팔로잉 가져오기");
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const patchNickname = async (nickname: string) => {
  try {
    const {data} = await defaultInstance.patch('/users/me', { nickname });
    console.log('유저 가져오기');
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

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

export const signUpUser = async (userData: { nickname: string; email: string; password: string }) => {
  try {
    const response = await defaultInstance.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('회원가입 API 호출에 실패했습니다:', error);
    throw error;
  }
};

// ✅ 이미 위 대화에서 만들었던 것들(있다면 중복 선언 제거!)
export const patchMyDescription = async (description: string) => {
  try {
    const { data } = await defaultInstance.patch('/users/me', { description });
  return data;
  } catch (error: any) {
    console.log('[patchMyDescription] error', {
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

export const patchMyProfileImageByUrl = async (profileImageUrl: string) => {
  try {
    const { data } = await defaultInstance.patch('/users/me/profile-image', { profileImageUrl });
    return data;
  } catch (error: any) {
    console.log('[patchMyProfileImageByUrl] error', {
      status: error?.response?.status,
      data: error?.response?.data,
    });
    throw error;
  }
};

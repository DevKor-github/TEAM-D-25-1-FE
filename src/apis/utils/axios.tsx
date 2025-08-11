import axios, {AxiosRequestConfig} from 'axios';

const BASE_URL = 'https://api.groo.space';

const axiosApi = (url: any, options: AxiosRequestConfig = {}, token?: string) => {
  const instance = axios.create({
    baseURL: url,
    headers: {
      ...(options.headers || {}),
      ...(token && {Authorization: `Bearer ${token}`}),
    },
    ...options,
  });
  return instance;
};

export const defaultInstance = axiosApi(BASE_URL);
// 참고: https://ghost4551.tistory.com/163

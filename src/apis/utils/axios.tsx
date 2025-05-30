import axios, {AxiosRequestConfig} from 'axios';

const BASE_URL = 'https://api.groo.space';

const axiosApi = (url: any, options: AxiosRequestConfig = {}) => {
  const instance = axios.create({baseURL: url, ...options});
  return instance;
};

export const defaultInstance = axiosApi(BASE_URL);
// 참고: https://ghost4551.tistory.com/163

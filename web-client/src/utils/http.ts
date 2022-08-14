import axios, { AxiosResponse } from 'axios';
import { UserConstants } from './types';

export const http = axios.create();

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(UserConstants.JWT);
  if (token != null) {
    if (config.headers == null) {
      config.headers = {};
    }
    config.headers.Authorization = token;
  }

  return config;
});

export type HttpResponse<T> = AxiosResponse<T>;

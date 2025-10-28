import axios from 'axios';
import { BASE_URL, TIMEOUT } from './env';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface network errors in a consistent way for screens/hooks to handle.
    const normalizedError = error.response ?? error;
    return Promise.reject(normalizedError);
  },
);

// -------------------------------------------------------------
// Axios compatibility wrapper over Native Fetch (No XHR)
// -------------------------------------------------------------
import client, { getStoredToken, setStoredToken, API_BASE_URL } from './client';

export { getStoredToken, setStoredToken, API_BASE_URL };

const axiosInstance = {
  get: (url, config = {}) => client.get(url, config),
  post: (url, data, config = {}) => client.post(url, data, config),
  put: (url, data, config = {}) => client.put(url, data, config),
  patch: (url, data, config = {}) => client.patch(url, data, config),
  delete: (url, config = {}) => client.delete(url, config)
};

export default axiosInstance;

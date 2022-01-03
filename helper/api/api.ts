import axios from "axios";

const service = axios.create();

service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(error.response.status);
    return Promise.reject(error);
  }
);

export default service;
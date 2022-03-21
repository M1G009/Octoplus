import axios from "axios";

const service = axios.create();

service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if(error.response.data && error.response.data.message){
      return Promise.reject(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default service;
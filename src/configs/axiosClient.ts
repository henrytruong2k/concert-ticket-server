import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

const axiosClient: AxiosInstance = axios.create({
  timeout: 10000, // Timeout sau 10 giây
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log(`[Request] ${config.method?.toUpperCase()} - ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  },
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[Response] ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("[Response Error]", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export default axiosClient;

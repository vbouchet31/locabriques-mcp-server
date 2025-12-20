import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = 'https://locabriques.fr';

export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'User-Agent': 'LocaBriques-MCP/1.0.0',
        'Content-Type': 'application/json',
        ...(process.env.LOCABRIQUES_API_TOKEN
            ? { Authorization: `Token ${process.env.LOCABRIQUES_API_TOKEN}` }
            : {}),
    },
});

// Response interceptor for better error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            const data = error.response.data as any;
            const message = data?.message || error.message;

            // We throw a descriptive error that can be caught and returned to the LLM
            throw new Error(`LocaBriques API Error [${status}]: ${message}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('LocaBriques API Error: No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`LocaBriques API Error: ${error.message}`);
        }
    }
);

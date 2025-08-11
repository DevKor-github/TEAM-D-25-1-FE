// src/utils/axios.ts
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios'; // Import AxiosError for response interceptor
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing/retrieving tokens
// Import the token retrieval function from your auth service
import { getCustomApplicationToken, logoutAndClearToken } from '../api/login'; // Adjust path if needed, also import logoutAndClearToken for 401 handling

const BASE_URL = 'https://api.groo.space';

// 1. Create the default Axios instance
// This instance is created once when your app starts.
export const defaultInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // You can add other default headers here if needed
  },
  timeout: 10000, // Optional: default timeout for requests (10 seconds)
});

// 2. Add a Request Interceptor
// This interceptor will run BEFORE every request made using 'defaultInstance'.
defaultInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Check if the request URL is NOT the token exchange endpoint.
    // We don't want to add the custom application token to the request that *gets* the custom application token.
    if (config.url !== '/auth/sign-in/firebase' && config.headers) {
      try {
        const authToken = await getCustomApplicationToken(); // Retrieve the token from AsyncStorage
        if (authToken) {
          // If a token is found, set the Authorization header
          config.headers.Authorization = `Bearer ${authToken}`;
        }
      } catch (error) {
        console.error('Error retrieving auth token in Axios interceptor:', error);
        // If there's an error getting the token, the request will proceed without it.
        // The backend should then return a 401 Unauthorized error.
      }
    }
    return config; // Return the modified request configuration
  },
  (error: AxiosError) => {
    // Handle any errors that occur during the request setup (e.g., network issues)
    console.error('Axios Request Error:', error);
    return Promise.reject(error); // Propagate the error
  }
);

// 3. Add a Response Interceptor (Optional but highly recommended for global error handling)
// This interceptor will run AFTER every response received by 'defaultInstance'.
defaultInstance.interceptors.response.use(
  (response) => response, // If the response is successful, just return it
  async (error: AxiosError) => {
    // Handle specific error codes globally
    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401: // Unauthorized
          console.warn('Axios Response Error: 401 Unauthorized. Token might be invalid or expired.');
          // Attempt to clear the token and potentially redirect to login
          // This assumes `logoutAndClearToken` is available and handles Firebase signOut + AsyncStorage clear
          await logoutAndClearToken();
          // In a real app, you'd typically dispatch a navigation action here
          // e.g., navigation.navigate('Login');
          // Since interceptors are outside React components, you'd need a global navigation service or context.
          break;
        case 403: // Forbidden
          console.warn('Axios Response Error: 403 Forbidden. User does not have necessary permissions.');
          break;
        case 500: // Internal Server Error
          console.error('Axios Response Error: 500 Internal Server Error. Please check backend logs.');
          break;
        default:
          console.error(`Axios Response Error: Status ${status}, Data:`, error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., network down)
      console.error('Axios Response Error: No response received from server.', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Axios Response Error: Request setup failed.', error.message);
    }

    return Promise.reject(error); // Re-throw the error so it can be caught by the calling function
  }
);
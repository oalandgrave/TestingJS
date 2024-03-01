const axios = require('axios');

// Function to create an Axios instance with retry logic
const createAxiosInstanceWithRetry = () => {
  const axiosInstance = axios.create({
    // Your Axios configuration options go here
  });

  // Initialize the retry count
  axiosInstance.defaults.retry = 3; // Number of retry attempts
  axiosInstance.defaults.retryDelay = 1000; // Delay between retries in milliseconds

  // Axios request interceptor for handling retries
  axiosInstance.interceptors.request.use((config) => {
    config.retry = config.retry || axiosInstance.defaults.retry;
    config.retryDelay = config.retryDelay || axiosInstance.defaults.retryDelay;
    return config;
  });

  // Axios response interceptor for handling retries
  axiosInstance.interceptors.response.use(
    undefined,
    (error) => {
      const { config, response } = error;

      // If the request should be retried and the maximum retry count hasn't been reached
      if (config.retry && response && response.status === 500 && config.retry > 0) {
        config.retry--;

        // Create a new promise to handle the delay
        const retryPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, config.retryDelay);
        });

        // Return the promise chain with the retry
        return retryPromise.then(() => axiosInstance(config));
      }

      // If the request should not be retried, or the maximum retry count has been reached
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

// Example usage
const axiosWithRetry = createAxiosInstanceWithRetry();

axiosWithRetry.get('https://api.example.com/data')
  .then((response) => {
    console.log('Request successful:', response.data);
  })
  .catch((error) => {
    console.error('Request failed:', error.message);
  });

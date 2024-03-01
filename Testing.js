class AxiosRateLimit {
  // ... (existing code)

  // Define a method to handle requests with retries
  handleRequest(request: AxiosRequestConfig, retryCount = 3): Promise<AxiosRequestConfig> {
    return new Promise((resolve, reject) => {
      const retry = async (count: number) => {
        try {
          const result = await this.push({ resolve: () => resolve(request) });
          return result;
        } catch (error) {
          if (count <= 0) {
            reject(error);
          } else {
            // Retry after a short delay (e.g., 500 ms)
            setTimeout(async () => {
              await retry(count - 1);
            }, 500);
          }
        }
      };

      retry(retryCount);
    });
  }

  // ... (existing code)

  // Define a method to push a request handler to the queue
  push(requestHandler: RequestHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(requestHandler);
      this.shiftInitial();
      resolve();
    });
  }

  // ... (existing code)
}

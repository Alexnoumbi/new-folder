interface PollingOptions {
  interval?: number;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

class PollingService {
  private intervals: { [key: string]: NodeJS.Timeout } = {};
  private retries: { [key: string]: number } = {};
  private readonly DEFAULT_INTERVAL = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;

  startPolling(
    key: string,
    fetchFn: () => Promise<any>,
    options: PollingOptions = {}
  ): void {
    const {
      interval = this.DEFAULT_INTERVAL,
      maxRetries = this.MAX_RETRIES,
      onError
    } = options;

    // Clear any existing interval for this key
    this.stopPolling(key);
    this.retries[key] = 0;

    const poll = async () => {
      try {
        await fetchFn();
        this.retries[key] = 0; // Reset retries on success
      } catch (error) {
        this.retries[key]++;
        if (this.retries[key] >= maxRetries) {
          this.stopPolling(key);
          if (onError) {
            onError(error as Error);
          }
          return;
        }
        if (onError) {
          onError(error as Error);
        }
      }
    };

    // Initial fetch
    poll();

    // Set up polling interval
    this.intervals[key] = setInterval(poll, interval);
  }

  stopPolling(key: string): void {
    if (this.intervals[key]) {
      clearInterval(this.intervals[key]);
      delete this.intervals[key];
      delete this.retries[key];
    }
  }

  stopAllPolling(): void {
    Object.keys(this.intervals).forEach(key => this.stopPolling(key));
  }

  isPolling(key: string): boolean {
    return !!this.intervals[key];
  }
}

export const pollingService = new PollingService();

// Make this file explicitly a module for --isolatedModules
export {};

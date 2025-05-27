/**
 * Global Error Handler - Catches unhandled promise rejections and runtime errors
 */

interface ErrorReport {
  message: string;
  stack?: string;
  type: 'unhandled-rejection' | 'runtime-error' | 'resource-error';
  timestamp: string;
  url: string;
  userAgent: string;
  errorId: string;
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: ErrorReport[] = [];
  private maxErrors = 50;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  public initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    console.log('🛡️ Initializing global error handler...');

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    // Handle runtime errors
    window.addEventListener('error', this.handleRuntimeError.bind(this));

    // Handle resource loading errors
    window.addEventListener('error', this.handleResourceError.bind(this), true);

    // Patch console.error to catch additional errors
    this.patchConsoleError();

    // Handle network errors
    this.setupNetworkErrorHandling();

    // Cleanup old errors periodically
    setInterval(() => {
      this.cleanupOldErrors();
    }, 300000); // Every 5 minutes

    this.isInitialized = true;
    console.log('✅ Global error handler initialized');
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    console.error('🚨 Unhandled Promise Rejection:', event.reason);

    // Prevent the default browser error handling
    event.preventDefault();

    // Create error report
    const errorReport: ErrorReport = {
      message: this.extractErrorMessage(event.reason),
      stack: event.reason?.stack,
      type: 'unhandled-rejection',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.generateErrorId()
    };

    this.reportError(errorReport);

    // Try to recover from common Promise rejection scenarios
    this.attemptRecovery(event.reason);
  }

  private handleRuntimeError(event: ErrorEvent): void {
    // Only handle window-level runtime errors
    if (event.target && event.target instanceof HTMLElement) {
      return; // This is a resource error, skip
    }

    console.error('🚨 Runtime Error:', event.error);

    const errorReport: ErrorReport = {
      message: event.message,
      stack: event.error?.stack,
      type: 'runtime-error',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.generateErrorId()
    };

    this.reportError(errorReport);

    // Try to recover from common runtime errors
    this.attemptRecovery(event.error);
  }

  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;
    
    // Only handle actual resource loading errors
    if (!target || target === window || !('src' in target)) {
      return;
    }

    console.warn('⚠️ Resource Loading Error:', (target as any).src);

    const errorReport: ErrorReport = {
      message: `Failed to load resource: ${(target as any).src}`,
      type: 'resource-error',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorId: this.generateErrorId()
    };

    this.reportError(errorReport);

    // Try to recover from resource loading errors
    this.attemptResourceRecovery(target);
  }

  private patchConsoleError(): void {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Call original console.error
      originalConsoleError.apply(console, args);

      // Check if this is an error we should track
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      // Only track actual errors, not warnings or debug messages
      if (errorMessage.toLowerCase().includes('error') || 
          errorMessage.toLowerCase().includes('failed') ||
          errorMessage.toLowerCase().includes('exception')) {
        
        const errorReport: ErrorReport = {
          message: errorMessage,
          type: 'runtime-error',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          errorId: this.generateErrorId()
        };

        this.reportError(errorReport);
      }
    };
  }

  private setupNetworkErrorHandling(): void {
    // Patch fetch to handle network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args);
        
        // Log failed requests
        if (!response.ok) {
          console.warn(`🌐 Network Error: ${response.status} ${response.statusText} for ${args[0]}`);
        }
        
        return response;
      } catch (error) {
        console.error('🌐 Fetch Error:', error);
        
        const errorReport: ErrorReport = {
          message: `Network request failed: ${this.extractErrorMessage(error)}`,
          stack: (error as Error)?.stack,
          type: 'runtime-error',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          errorId: this.generateErrorId()
        };

        this.reportError(errorReport);
        throw error;
      }
    };
  }

  private attemptRecovery(error: any): void {
    try {
      const errorMessage = this.extractErrorMessage(error);

      // Recovery strategies for common errors
      if (errorMessage.includes('ChunkLoadError') || errorMessage.includes('Loading chunk')) {
        console.log('🔄 Attempting to recover from chunk loading error...');
        // Clear module cache and reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }

      if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
        console.log('🔄 Attempting to recover from network error...');
        // Implement retry logic or show offline message
        this.handleNetworkError();
        return;
      }

      if (errorMessage.includes('WebSocket') || errorMessage.includes('socket')) {
        console.log('🔄 Attempting to recover from WebSocket error...');
        // Reinitialize WebSocket connection
        this.handleSocketError();
        return;
      }

      if (errorMessage.includes('TypeError') || errorMessage.includes('Cannot read property')) {
        console.log('🔄 Attempting to recover from TypeError...');
        // Clear potentially corrupted state
        this.clearPotentiallyCorruptedState();
        return;
      }

    } catch (recoveryError) {
      console.warn('Recovery attempt failed:', recoveryError);
    }
  }

  private attemptResourceRecovery(element: HTMLElement): void {
    try {
      if (element.tagName === 'IMG') {
        const img = element as HTMLImageElement;
        // Try to reload the image with a cache-busting parameter
        if (img.src && !img.src.includes('?retry=')) {
          setTimeout(() => {
            img.src = `${img.src}?retry=${Date.now()}`;
          }, 1000);
        }
      } else if (element.tagName === 'SCRIPT') {
        const script = element as HTMLScriptElement;
        // Try to reload the script
        if (script.src && !script.src.includes('?retry=')) {
          const newScript = document.createElement('script');
          newScript.src = `${script.src}?retry=${Date.now()}`;
          newScript.async = true;
          document.head.appendChild(newScript);
        }
      }
    } catch (error) {
      console.warn('Resource recovery failed:', error);
    }
  }

  private handleNetworkError(): void {
    // Check if we're offline
    if (!navigator.onLine) {
      console.log('📡 Device is offline');
      // Show offline message or retry when online
      window.addEventListener('online', () => {
        console.log('📡 Device is back online, retrying...');
        window.location.reload();
      }, { once: true });
    }
  }

  private handleSocketError(): void {
    // Attempt to reinitialize socket connections
    try {
      if ((window as any).socket) {
        console.log('🔌 Attempting to reconnect socket...');
        (window as any).socket.connect();
      }
    } catch (error) {
      console.warn('Socket reconnection failed:', error);
    }
  }

  private clearPotentiallyCorruptedState(): void {
    try {
      // Clear potentially corrupted localStorage items
      const keysToCheck = ['error_', 'blob:', 'temp_'];
      Object.keys(localStorage).forEach(key => {
        if (keysToCheck.some(prefix => key.startsWith(prefix))) {
          localStorage.removeItem(key);
        }
      });

      // Revoke blob URLs
      const blobUrls = Array.from(document.querySelectorAll('img, video, audio'))
        .map(el => (el as HTMLImageElement | HTMLVideoElement | HTMLAudioElement).src)
        .filter(src => src && src.startsWith('blob:'));
      
      blobUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore revoke errors
        }
      });

      console.log('🧹 Cleared potentially corrupted state');
    } catch (error) {
      console.warn('State cleanup failed:', error);
    }
  }

  private reportError(errorReport: ErrorReport): void {
    // Add to queue
    this.errorQueue.push(errorReport);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxErrors) {
      this.errorQueue.shift();
    }

    // Store in localStorage for debugging
    try {
      localStorage.setItem(`error_${errorReport.errorId}`, JSON.stringify(errorReport));
    } catch (e) {
      // localStorage might be full or disabled
    }

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorReport);
    }
  }

  private sendToMonitoring(errorReport: ErrorReport): void {
    // Example: Send to error monitoring service
    try {
      // You can integrate with services like Sentry, LogRocket, etc.
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // }).catch(() => {
      //   // Ignore monitoring errors
      // });
      
      console.log('📊 Error report would be sent to monitoring service:', errorReport.errorId);
    } catch (e) {
      // Ignore monitoring errors
    }
  }

  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object') {
      return error.message || error.name || String(error);
    }
    return String(error);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldErrors(): void {
    try {
      // Remove errors older than 1 hour from localStorage
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('error_')) {
          try {
            const errorData = JSON.parse(localStorage.getItem(key) || '{}');
            if (errorData.timestamp && errorData.timestamp < oneHourAgo) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Remove invalid error data
            localStorage.removeItem(key);
          }
        }
      });

      // Clean up error queue
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 minutes
      this.errorQueue = this.errorQueue.filter(error => error.timestamp > cutoff);

    } catch (error) {
      console.warn('Error cleanup failed:', error);
    }
  }

  public getRecentErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }

  public clearErrors(): void {
    this.errorQueue = [];
    
    // Clear from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('error_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  globalErrorHandler.initialize();
} 
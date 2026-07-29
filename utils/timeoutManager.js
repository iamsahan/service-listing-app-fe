/**
 * Centralized timeout management utility for booking assignments
 * Handles localStorage persistence and timeout calculations
 */

class TimeoutManager {
  constructor() {
    this.STORAGE_KEY = "booking_assignment_timeouts";
    this.listeners = new Set();
    this.cleanupInterval = null;
    this.startCleanupInterval();
  }

  /**
   * Store timeout data immediately when socket notification is received
   * @param {string} bookingId - Booking ID
   * @param {number} timeoutMs - Timeout duration in milliseconds
   * @param {number} receivedAt - Server timestamp when assignment was created
   * @param {number} expiresAt - Server timestamp when assignment expires
   */
  storeTimeout(bookingId, timeoutMs, receivedAt = Date.now(), expiresAt = null) {
    if (!this.isBrowser()) {
      console.warn("Cannot store timeout: not in browser environment");
      return false;
    }

    try {
      const timeouts = this.loadTimeouts();

      // Calculate expiresAt if not provided
      const calculatedExpiresAt = expiresAt || (receivedAt + timeoutMs);

      const timeoutData = {
        bookingId,
        timeoutMs,
        receivedAt,
        expiresAt: calculatedExpiresAt,
        originalTimeout: timeoutMs,
        startTime: receivedAt,
      };

      timeouts[bookingId] = timeoutData;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timeouts));

      console.log(`Stored timeout for booking ${bookingId}:`, {
        timeoutMs: Math.round(timeoutMs / 1000) + "s",
        receivedAt: new Date(receivedAt).toLocaleTimeString(),
        expiresAt: new Date(calculatedExpiresAt).toLocaleTimeString(),
      });

      // Notify listeners
      this.notifyListeners("timeout_stored", { bookingId, timeoutData });

      return true;
    } catch (error) {
      console.warn("Failed to store timeout:", error);
      return false;
    }
  }

  /**
   * Get remaining time for a booking based on server expires_at timestamp
   */
  getRemainingTime(bookingId) {
    try {
      const timeouts = this.loadTimeouts();
      const timeoutData = timeouts[bookingId];

      if (!timeoutData) {
        return null;
      }

      const now = Date.now();
      
      // Use expiresAt if available, otherwise calculate from receivedAt
      const expiresAt = timeoutData.expiresAt || (timeoutData.receivedAt + timeoutData.originalTimeout);
      const remaining = Math.max(0, expiresAt - now);
      const elapsed = now - timeoutData.receivedAt;

      return {
        remainingMs: remaining,
        totalMs: timeoutData.originalTimeout,
        elapsedMs: elapsed,
        expiresAt: expiresAt,
        hasExpired: remaining <= 0,
        timeoutData,
      };
    } catch (error) {
      console.warn("Failed to get remaining time:", error);
      return null;
    }
  }

  /**
   * Get all active timeouts (non-expired) based on server expires_at
   */
  getActiveTimeouts() {
    try {
      const timeouts = this.loadTimeouts();
      const now = Date.now();
      const activeTimeouts = {};

      Object.entries(timeouts).forEach(([bookingId, data]) => {
        const expiresAt = data.expiresAt || (data.receivedAt + data.originalTimeout);
        const remaining = Math.max(0, expiresAt - now);
        const elapsed = now - data.receivedAt;

        if (remaining > 1000) {
          // At least 1 second remaining
          activeTimeouts[bookingId] = {
            ...data,
            remainingMs: remaining,
            elapsedMs: elapsed,
            expiresAt: expiresAt,
          };
        }
      });

      return activeTimeouts;
    } catch (error) {
      console.warn("Failed to get active timeouts:", error);
      return {};
    }
  }

  /**
   * Remove timeout for a booking
   */
  removeTimeout(bookingId) {
    if (!this.isBrowser()) {
      console.warn("Cannot remove timeout: not in browser environment");
      return false;
    }

    try {
      const timeouts = this.loadTimeouts();
      delete timeouts[bookingId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timeouts));

      console.log(`Removed timeout for booking ${bookingId}`);

      // Notify listeners
      this.notifyListeners("timeout_removed", { bookingId });

      return true;
    } catch (error) {
      console.warn("Failed to remove timeout:", error);
      return false;
    }
  }

  /**
   * Check if a booking has an active timeout
   */
  hasActiveTimeout(bookingId) {
    const remaining = this.getRemainingTime(bookingId);
    return remaining && !remaining.hasExpired;
  }

  /**
   * Check if we're in a browser environment
   */
  isBrowser() {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  /**
   * Load timeouts from localStorage
   */
  loadTimeouts() {
    if (!this.isBrowser()) {
      return {};
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn("Failed to load timeouts from localStorage:", error);
      return {};
    }
  }

  /**
   * Clean up expired timeouts based on server expires_at timestamp
   */
  cleanupExpiredTimeouts() {
    if (!this.isBrowser()) {
      return false;
    }

    try {
      const timeouts = this.loadTimeouts();
      const now = Date.now();
      let hasChanges = false;

      Object.entries(timeouts).forEach(([bookingId, data]) => {
        const expiresAt = data.expiresAt || (data.receivedAt + data.originalTimeout);
        
        // Check if current time has passed the expiration time
        if (now >= expiresAt) {
          delete timeouts[bookingId];
          hasChanges = true;
          console.log(`Cleaned up expired timeout for booking ${bookingId}`);

          // Notify listeners about expiration
          this.notifyListeners("timeout_expired", { bookingId });
        }
      });

      if (hasChanges) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timeouts));
        this.notifyListeners("timeouts_cleaned");
      }

      return hasChanges;
    } catch (error) {
      console.warn("Failed to cleanup expired timeouts:", error);
      return false;
    }
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval() {
    if (!this.isBrowser()) {
      return;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTimeouts();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all timeout data
   */
  clearAllTimeouts() {
    if (!this.isBrowser()) {
      console.warn("Cannot clear timeouts: not in browser environment");
      return false;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("Cleared all timeout data");
      this.notifyListeners("all_timeouts_cleared");
      return true;
    } catch (error) {
      console.warn("Failed to clear all timeouts:", error);
      return false;
    }
  }

  /**
   * Add listener for timeout events
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of timeout events
   */
  notifyListeners(event, data = {}) {
    this.listeners.forEach((callback) => {
      try {
        callback({ event, ...data });
      } catch (error) {
        console.warn("Error in timeout listener:", error);
      }
    });
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    const timeouts = this.loadTimeouts();
    const now = Date.now();

    return {
      totalStored: Object.keys(timeouts).length,
      activeCount: Object.keys(this.getActiveTimeouts()).length,
      timeouts: Object.entries(timeouts).map(([bookingId, data]) => {
        const expiresAt = data.expiresAt || (data.receivedAt + data.originalTimeout);
        const remainingMs = Math.max(0, expiresAt - now);
        
        return {
          bookingId,
          remainingMs,
          totalMs: data.originalTimeout,
          elapsedMs: now - data.receivedAt,
          receivedAt: new Date(data.receivedAt).toLocaleTimeString(),
          expiresAt: new Date(expiresAt).toLocaleTimeString(),
          hasExpired: now >= expiresAt,
        };
      }),
    };
  }
}

// Create singleton instance
const timeoutManager = new TimeoutManager();

// Expose for debugging
if (typeof window !== "undefined") {
  window.timeoutManager = timeoutManager;
}

export default timeoutManager;

/**
 * Cross-Tab Live Sync & Web Notification Engine
 * Enables real-time testing between 2 tabs or users with automatic balance transfers
 */

import { LiveSyncMessage } from '../types';

const CHANNEL_NAME = 'kaipay_sync_channel';

class SyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: LiveSyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.notifyListeners(event.data);
          }
        };
      } catch {
        this.channel = null;
      }
    }

    // Storage event fallback for older browsers or if BroadcastChannel is blocked
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'kaipay_live_event_trigger' && event.newValue) {
          try {
            const data: LiveSyncMessage = JSON.parse(event.newValue);
            this.notifyListeners(data);
          } catch {}
        }
      });
    }
  }

  /**
   * Broadcast an event across all open browser tabs
   */
  public broadcast(message: LiveSyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {}
    }

    // Also trigger via localStorage so storage events fire in other tabs
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kaipay_live_event_trigger', JSON.stringify({
          ...message,
          _rand: Math.random(),
        }));
      } catch {}
    }
  }

  /**
   * Register a listener for incoming cross-tab messages
   */
  public subscribe(callback: (msg: LiveSyncMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(message: LiveSyncMessage) {
    this.listeners.forEach((callback) => {
      try {
        callback(message);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  /**
   * Native Browser Push Notifications
   */
  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public getNotificationPermission(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public sendNativeNotification(title: string, options?: NotificationOptions) {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          ...options,
        });
      } catch {
        // Ignored if service worker required or blocked
      }
    }
  }
}

export const liveSync = new SyncManager();

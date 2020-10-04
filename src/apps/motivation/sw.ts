import { skipWaiting, clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import type { PrecacheEntry } from 'workbox-precaching/_types';

type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';

declare global {
  interface Window {
    __WB_MANIFEST: PrecacheEntry[];
    clients: {
      claim(): Promise<void>;
      get(id: string): Promise<WindowClient>;
      matchAll<T extends ClientType = ClientType>(options?: {
        includeUncontrolled?: boolean;
        type?: T;
      }): Promise<Array<T extends 'window' ? WindowClient : Client>>;
      openWindow(url: string): Promise<WindowClient>;
    };
    registration: ServiceWorkerRegistration;
  }
  interface WindowEventMap {
    push: PushEvent;
    notificationclick: NotificationEvent;
    fetch: FetchEvent;
  }
  function skipWaiting(): void;
}

skipWaiting();
clientsClaim();

precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

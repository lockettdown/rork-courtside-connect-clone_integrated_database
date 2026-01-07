import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

import Constants from "expo-constants";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  if (Constants.expoConfig?.hostUri) {
    const hostUri = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${hostUri}:8081`;
  }

  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch(url, options) {
        console.log('tRPC fetch URL:', url);
        return fetch(url, options).catch(error => {
          console.error('tRPC fetch error:', error);
          console.error('URL:', url);
          console.error('Base URL:', getBaseUrl());
          throw error;
        });
      },
    }),
  ],
});

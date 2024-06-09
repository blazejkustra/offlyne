export const KEYS = {
  USER: 'user',
  IS_OFFLINE: 'isOffline',
} as const;

export type Values = {
  [KEYS.USER]?: { name: string };
  [KEYS.IS_OFFLINE]: boolean;
};

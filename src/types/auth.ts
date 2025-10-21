export interface User {
  id: string;
  email: string | null;
  username: string;
  nickname: string;
  socialProvider: 'GOOGLE' | 'APPLE' | null;
  socialId: string | null;
  isPrivate: boolean;
  status: 'ACTIVE' | 'BANNED' | 'DELETED';
  firebaseUid: string;
  isOnboarded: boolean;
  profileImageUrl: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
}
import { getAuth } from '@react-native-firebase/auth';
import { defaultInstance } from '../utils/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const exchangeFirebaseTokenWithBackend = async (idToken: string) => {
  try {
    const {data} = await defaultInstance.post('/auth/sign-in/firebase', {
        firebaseAccessToken: idToken,
        socialProvider: undefined,
    });

    await AsyncStorage.setItem('customApplicationToken', data.accessToken);

    return data.accessToken;
  } catch (error) {
    console.log("토큰 에러");
    console.log(idToken);
    return error;
  }
};

export const getCustomApplicationToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('customApplicationToken');
    return token;
  } catch (error) {
    console.error('Error retrieving custom application token:', error);
    return null;
  }
};

export const logoutAndClearToken = async (): Promise<void> => {
  try {
    const auth = getAuth();
    await auth.signOut();
    await AsyncStorage.removeItem('customApplicationToken');
    console.log('User logged out and tokens cleared.');
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};


import {useState, useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';

export const useFcmToken = (): [
  string,
  React.Dispatch<React.SetStateAction<string>>,
] => {
  const [fcmToken, setFcmToken] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        // 알림 권한 요청 (iOS에서 필요)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const tempFcmToken = await messaging().getToken();

          if (tempFcmToken) {
            console.log('FCM Token:', tempFcmToken);
            setFcmToken(tempFcmToken);
          }
        }
      } catch (error) {
        console.error('FCM Token 가져오기 실패:', error);
      }
    })();
  }, []);

  return [fcmToken, setFcmToken];
};

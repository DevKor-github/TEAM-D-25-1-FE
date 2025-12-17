// App.tsx
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Provider, useSelector, useDispatch} from 'react-redux';
import {RootState, store} from './src/redux/store';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import BottomNavigationBar from './src/navigations/bottomNavigationBar';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ProfileEditScreen from './src/screens/Mypage/ProfileEditScreen';
import CafeDetailScreen from './src/screens/CafeDetailScreen';
import PhotoDetailScreen from './src/screens/PhotoDetailScreen';
import MyPageScreen from './src/screens/Mypage/MypageScreen';
import FollowListScreen from './src/screens/Mypage/FollowListScreen';
import KeywordSelectionScreen from './src/screens/Mypage/KeywordSelectionScreen';
import SearchScreen from './src/screens/SearchScreen';
import FriendScreen from './src/screens/FriendScreen';

import auth from '@react-native-firebase/auth';
import {exchangeFirebaseTokenWithBackend} from './src/apis/api/login';
import {setCredentials, logout, setLoading} from './src/redux/authSlice';
import CompleteScreen from './src/screens/Planting/CompleteScreen';

// ✅ RNFirebase 코어: 앱 초기화 보장
import { getApps, initializeApp } from '@react-native-firebase/app';
// (구식 네임스페이스 import 제거) import auth from '@react-native-firebase/auth';

// 앱 시작 시 기본 앱([DEFAULT])이 없으면 초기화
if (!getApps().length) {
  initializeApp(); // iOS의 GoogleService-Info.plist / Android의 google-services.json을 자동 사용
}

const Stack = createStackNavigator();

const AppContent = () => {
  const {isAuthenticated, isOnboarded, isLoading} = useSelector(
    (state: RootState) => state.auth,
  );
  const dispatch = useDispatch();

  // ✅ 자동 로그인 처리
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async firebaseUser => {
      console.log('🔥 Firebase 유저:', firebaseUser ? '있음' : '없음');
      try {
        if (firebaseUser) {
          console.log('Firebase 유저 ID:', firebaseUser.uid);
          const idToken = await firebaseUser.getIdToken(true);
          const {accessToken, user} = await exchangeFirebaseTokenWithBackend(idToken);
          console.log('백엔드 로그인 성공:', user);
          dispatch(setCredentials({accessToken, user}));
        } else {
        console.log('로그아웃 상태 감지');
        dispatch(logout());
      }
      } catch (error) {
        console.error('자동 로그인 처리 중 에러:', error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    });
    return subscriber;
  }, [dispatch]);

  if (isLoading) return <SplashScreen navigation={''} />;

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* 공통 스크린 */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={RegisterScreen} />
      <Stack.Screen name="Onboard" component={OnboardingScreen} />

      {/* Map 스크린 항상 등록 */}
      <Stack.Screen name="Map" component={BottomNavigationBar} />
      <Stack.Screen name="Complete" component={CompleteScreen}/>

      {/* 조건에 따라 초기 화면만 변경 */}
      {!isAuthenticated ? (
        <Stack.Screen name="Initial" component={LoginScreen} />
      ) : !isOnboarded ? (
        <Stack.Screen name="Initial" component={OnboardingScreen} />
      ) : (
        <Stack.Screen name="Initial" component={BottomNavigationBar} />
      )}

      {/* 나머지 스크린 */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Detail" component={CafeDetailScreen} />
      <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen} />
      <Stack.Screen name="Mypage" component={MyPageScreen} />
      <Stack.Screen name="FollowList" component={FollowListScreen} />
      <Stack.Screen
        name="KeywordSelection"
        component={KeywordSelectionScreen}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Friend" component={FriendScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </Provider>
  );
};

export default App;

// App.tsx (또는 App.js)
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/Register/SignUpScreen';
import PasswordScreen from './src/screens/Register/PasswordScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomNavigationBar from './src/navigations/bottomNavigationBar';
import DetailScreen from './src/screens/DetailScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import PhotoDetailScreen from './src/screens/PhotoDetailScreen';
import MyPageScreen from './src/screens/Mypage/MypageScreen';
import SearchScreen from './src/screens/SearchScreen';
import PlantScreen from './src/screens/Planting/PlantScreen';
import PlantSearchScreen from './src/screens/Planting/PlantSearchScreen';
import PlantSelectionScreen from './src/screens/Planting/PlantSelectionScreen';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { RootState, store } from './src/redux/store';
import ProfileEditScreen from './src/screens/Mypage/ProfileEditScreen';
import KeywordSelectionScreen from './src/screens/Mypage/KeywordSelectionScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CafeDetailScreen from './src/screens/CafeDetailScreen';
import FriendScreen from './src/screens/FriendScreen'
import FollowListScreen from './src/screens/Mypage/FollowListScreen';

// ✅ RNFirebase 코어: 앱 초기화 보장
import { getApps, initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { exchangeFirebaseTokenWithBackend } from './src/apis/api/login';
import { logout, setCredentials, setLoading } from './src/redux/authSlice';

// 앱 시작 시 기본 앱([DEFAULT])이 없으면 초기화
if (!getApps().length) {
  initializeApp(); // iOS의 GoogleService-Info.plist / Android의 google-services.json을 자동 사용
}

const Stack = createStackNavigator();

const AppContent = () => {
  const { isAuthenticated, isOnboarded, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch()
  
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken(true);
          const { accessToken, user } = await exchangeFirebaseTokenWithBackend(idToken);
          dispatch(setCredentials({ accessToken, user }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("자동 로그인 처리 중 에러:", error);
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    });
    return subscriber
  }, [dispatch])

  if (isLoading) {
    return <SplashScreen navigation={''}/>;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // 로그인 X
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : !isOnboarded ? (
          // 로그인 O, 온보딩 X
          <Stack.Screen name="Onboard" component={OnboardingScreen} />
        ) : (
          // 로그인 O, 온보딩 O
          <>
            <Stack.Screen name="Map" component={BottomNavigationBar} />
            
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
            <Stack.Screen name="Detail" component={CafeDetailScreen} />
            <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen} />
            <Stack.Screen name="Mypage" component={MyPageScreen} />
            <Stack.Screen name="FollowList" component={FollowListScreen} />
            <Stack.Screen name="KeywordSelection" component={KeywordSelectionScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Friend" component={FriendScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  console.log('📲 App loaded!');
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App;

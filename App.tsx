// App.tsx (또는 App.js)
import React from 'react';
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
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import ProfileEditScreen from './src/screens/Mypage/ProfileEditScreen';
import KeywordSelectionScreen from './src/screens/Mypage/KeywordSelectionScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CafeDetailScreen from './src/screens/CafeDetailScreen';
import FriendScreen from './src/screens/FriendScreen'
import FollowListScreen from './src/screens/Mypage/FollowListScreen';

// ✅ RNFirebase 코어: 앱 초기화 보장
import { getApps, initializeApp } from '@react-native-firebase/app';
// (구식 네임스페이스 import 제거) import auth from '@react-native-firebase/auth';

// 앱 시작 시 기본 앱([DEFAULT])이 없으면 초기화
if (!getApps().length) {
  initializeApp(); // iOS의 GoogleService-Info.plist / Android의 google-services.json을 자동 사용
}

const Stack = createStackNavigator();

const App = () => {
  console.log('📲 App loaded!');
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboard" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          {/* <Stack.Screen name="SignUp" component={SignUpScreen} /> */}
          {/* <Stack.Screen name="Password" component={PasswordScreen} /> */}
          <Stack.Screen name="Register" component={RegisterScreen} />
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
          <Stack.Screen name="Map" component={BottomNavigationBar} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Friend" component={FriendScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;

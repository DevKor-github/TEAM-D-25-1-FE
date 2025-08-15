import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import PasswordScreen from './src/screens/PasswordScreen';
import NicknameScreen from './src/screens/NicknameScreen';
import BottomNavigationBar from './src/navigations/bottomNavigationBar';
import DetailScreen from './src/screens/DetailScreen';
import WelcomeScreen from './src/screens/Signup/WelcomeScreen';
import PhotoDetailScreen from './src/screens/PhotoDetailScreen';
import MyPageScreen from './src/screens/MypageScreen';

import SearchScreen from './src/screens/SearchScreen';
import PlantScreen from './src/screens/Planting/PlantScreen';
import PlantSearchScreen from './src/screens/Planting/PlantSearchScreen';
import PlantSelectionScreen from './src/screens/Planting/PlantSelectionScreen';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import KeywordSelectionScreen from './src/screens/KeywordSelectionScreen';
import auth from '@react-native-firebase/auth';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CafeDetailScreen from './src/screens/CafeDetailScreen';

const Stack = createStackNavigator();

const App = () => {
  console.log('📲 App.js loaded!');
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={SplashScreen}/>
          <Stack.Screen name="Onboard" component={OnboardingScreen}/>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Password" component={PasswordScreen} />
          <Stack.Screen name="Nickname" component={NicknameScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen}/>
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen name="Detail" component={CafeDetailScreen}/>
          <Stack.Screen name="PhotoDetail" component={PhotoDetailScreen}/>
          <Stack.Screen name="Mypage" component={MyPageScreen}/>
          <Stack.Screen
            name="KeywordSelection"
            component={KeywordSelectionScreen}
          />
          <Stack.Screen name="Map" component={BottomNavigationBar} />
          <Stack.Screen name="Search" component={SearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;

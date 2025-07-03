import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import PasswordScreen from './src/screens/PasswordScreen';
import NicknameScreen from './src/screens/NicknameScreen';
import BottomNavigationBar from './src/navigations/bottomNavigationBar';
import DetailScreen from './src/screens/DetailScreen';
<<<<<<< HEAD
import SearchScreen from './src/screens/SearchScreen';
import PlantScreen from './src/screens/Planting/PlantScreen';
import PlantSearchScreen from './src/screens/Planting/PlantSearchScreen';
import PlantSelectionScreen from './src/screens/Planting/PlantSelectionScreen';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
=======
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import KeywordSelectionScreen from './src/screens/KeywordSelectionScreen';
>>>>>>> 2dc311a5a007e990afe1ed796aed14988e86654f

const Stack = createStackNavigator();

const App = () => {
  console.log('📲 App.js loaded!');
  return (
<<<<<<< HEAD
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Map"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Map" component={BottomNavigationBar} />
          {/* <Stack.Screen name="Detail" component={DetailScreen} /> */}
          <Stack.Screen name="Search" component={SearchScreen} />
          {/* <Stack.Screen name="Plant" component={PlantScreen} />
        <Stack.Screen name="PlantSearch" component={PlantSearchScreen} />
        <Stack.Screen name="PlantSelection" component={PlantSelectionScreen} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
=======
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Nickname"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Password" component={PasswordScreen} /> 
        <Stack.Screen name="Nickname" component={NicknameScreen} />
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen}/>
        <Stack.Screen name="KeywordSelection" component={KeywordSelectionScreen}/>
        <Stack.Screen name="Map" component={BottomNavigationBar} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
>>>>>>> 2dc311a5a007e990afe1ed796aed14988e86654f
  );
};

export default App;

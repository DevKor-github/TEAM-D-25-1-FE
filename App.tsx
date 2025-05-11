import React from 'react';
<<<<<<< HEAD
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MapScreen from './src/screens/MapScreen';
=======
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen'; 
>>>>>>> c8e23f9843e56aef980704c22a03cc82274f45cf

const Stack = createStackNavigator();

const App = () => {
  console.log('📲 App.js loaded!');
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;


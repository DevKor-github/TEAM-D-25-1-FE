import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import BottomNavigationBar from './src/navigations/bottomNavigationBar';
import DetailScreen from './src/screens/DetailScreen';
import SearchScreen from './src/screens/SearchScreen';
import PlantScreen from './src/screens/Planting/PlantScreen';
import PlantSearchScreen from './src/screens/Planting/PlantSearchScreen';
import PlantSelectionScreen from './src/screens/Planting/PlantSelectionScreen';

const Stack = createStackNavigator();

const App = () => {
  console.log('📲 App.js loaded!');
  return (
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
  );
};

export default App;

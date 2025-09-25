// src/navigations/mapNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/MapScreen';
import CafeDetailScreen from '../screens/CafeDetailScreen';

const Stack = createNativeStackNavigator();

export default function MapNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapScreen" component={MapScreen} />
      <Stack.Screen name="CafeDetail" component={CafeDetailScreen} />
    </Stack.Navigator>
  );
}

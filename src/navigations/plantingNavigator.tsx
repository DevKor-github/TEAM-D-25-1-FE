// src/navigations/PlantingNavigator.js
import React from 'react';
import {RouteProp} from '@react-navigation/native';
import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import PlantScreen from '../screens/Planting/PlantScreen';
import PlantSearchScreen from '../screens/Planting/PlantSearchScreen';
import PlantSelectionScreen from '../screens/Planting/PlantSelectionScreen';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {PlantingStackParamList, SeedType} from '../types/types';
import seedData from '../data/seedData';
const PlantStack = createStackNavigator<PlantingStackParamList>();

const PlantingNavigator = () => {
  return (
    <PlantStack.Navigator
      initialRouteName="PlantHome" // Give a distinct name for the initial screen of this stack
      screenOptions={{
        title: '씨앗 심기',
      }}>
      <PlantStack.Screen
        name="PlantHome" // Renamed from "Plant" to avoid confusion with the tab name
        component={PlantScreen}
        options={({navigation}) => ({
          title: '씨앗 심기',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('확인 버튼 눌림 (Direct Tab Screen Header)');
              }}>
              <Text style={{paddingRight: 20}}>확인</Text>
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#eee',
            padding: 20,
          },
          headerTitleAlign: 'center',
        })}
      />
      <PlantStack.Screen
        name="PlantSearch"
        component={PlantSearchScreen}
        options={({navigation}) => ({title: '장소 선택', headerShown: false})}
      />
      <PlantStack.Screen
        name="PlantSelection"
        component={PlantSelectionScreen}
        options={{
          title: '씨앗 심기',
        }}
      />
    </PlantStack.Navigator>
  );
};

// You might want to define styles for the header text/buttons here if not already global
const styles = StyleSheet.create({
  // ... your existing styles for headerTitleText etc.
});

export default PlantingNavigator;

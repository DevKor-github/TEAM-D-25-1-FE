// src/navigations/PlantingNavigator.js
import React, {useCallback} from 'react';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import {createStackNavigator, StackScreenProps} from '@react-navigation/stack';
import PlantScreen from '../screens/Planting/PlantScreen';
import PlantSearchScreen from '../screens/Planting/PlantSearchScreen';
import PlantSelectionScreen from '../screens/Planting/PlantSelectionScreen';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {AppDispatch, PlantingStackParamList, SavedSeedType} from '../types/types';
import seedData from '../data/seedData';
import {Provider, useDispatch} from 'react-redux';
import {resetSeedPlanting} from '../redux/seedPlantingSlice';
import {store} from '../redux/store';
import TagSelectionScreen from '../screens/Planting/TagSelectionScreen';
const PlantStack = createStackNavigator<PlantingStackParamList>();

const PlantingNavigator = () => {
  const dispatch: AppDispatch = useDispatch();

  // useFocusEffect를 사용하여 이 네비게이터가 포커스를 잃을 때 상태 초기화
  useFocusEffect(
    useCallback(() => {
      // 화면이 포커스를 잃을 때 (즉, 이 Plant 탭에서 다른 탭으로 이동할 때) 실행될 클린업 함수
      return () => {
        console.log('PlantingNavigator: Plant 탭을 떠나며 상태 초기화 시작!');
        dispatch(resetSeedPlanting()); // Redux 상태 초기화 액션 디스패치
        console.log('PlantingNavigator: 상태 초기화 액션 디스패치 완료!');
      };
    }, [dispatch]), // dispatch는 변경되지 않으므로 의존성 배열에 포함해도 안전합니다.
  );

  return (
    <PlantStack.Navigator
      initialRouteName="PlantHome" // Give a distinct name for the initial screen of this stack
      screenOptions={{
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
      }}>
      <PlantStack.Screen
        name="PlantHome" // Renamed from "Plant" to avoid confusion with the tab name
        component={PlantScreen}
        options={({navigation}) => ({
          title: '씨앗 심기',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // 필드 입력 조건 걸기
                navigation.goBack();
                console.log('확인 버튼 눌림 (Direct Tab Screen Header)');
              }}>
              <Text style={{paddingRight: 20}}>확인</Text>
            </TouchableOpacity>
          ),
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
          title: '씨앗 고르기',
        }}
      />
      <PlantStack.Screen
        name="TagSelection"
        component={TagSelectionScreen}
        options={{
          title: '태그 고르기',
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

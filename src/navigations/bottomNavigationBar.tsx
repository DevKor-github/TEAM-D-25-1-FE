// src/navigations/bottomNavigationBar.tsx
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import MapScreen from '../screens/MapScreen';
import LinearGradient from 'react-native-linear-gradient';
import HomeIcon from '../assets/home.svg';
import PlantIcon from '../assets/plant.svg';
import MyPageIcon from '../assets/mypage.svg';
import {StyleSheet, View} from 'react-native';
import PlantingNavigator from './plantingNavigator';
import MyPageScreen from '../screens/MypageScreen';

const Tab = createBottomTabNavigator();

const BottomNavigationBar = () => {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={{
        tabBarStyle: {
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
        // ✅ 라벨(텍스트) 색만 포커스 시 연두색으로
        tabBarActiveTintColor: '#6CDF44',
        tabBarInactiveTintColor: '#9AA0A6',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}>
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: '홈',
          // ✅ 아이콘은 tint(color) 무시하고 고정색 사용 → 라벨만 색 변함
          tabBarIcon: ({size}) => <HomeIcon color="#111" width={size} height={size} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Plant"
        component={PlantingNavigator}
        options={() => ({
          headerShown: false,
          tabBarIcon: ({size}) => (
            <View
              style={[
                styles.iconContainer,
                {width: size * 2.0, height: size * 2.0},
              ]}>
              <LinearGradient
                colors={['#AACFED', '#6CDF44']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientBackground}>
                {/* ✅ 아이콘은 항상 흰색 고정 */}
                <PlantIcon color="#FFFFFF" width={size * 1.5} height={size * 1.5} />
              </LinearGradient>
            </View>
          ),
        })}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          title: 'MY',
          // ✅ 아이콘 고정색
          tabBarIcon: ({size}) => <MyPageIcon color="#111" width={size} height={size} />,
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginBottom: 40,
    backgroundColor: '#00D100',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    width: 54,
    height: 54,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
});

export default BottomNavigationBar;

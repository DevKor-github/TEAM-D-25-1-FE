// src/navigations/bottomNavigationBar.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import HomeIcon from '../assets/home.svg';
import PlantIcon from '../assets/plant.svg';
import MyPageIcon from '../assets/mypage.svg';
import HomeIconActive from '../assets/clicked_home.svg';
import MyPageIconActive from '../assets/clicked_mypage.svg';
import { StyleSheet, View, Text } from 'react-native';

// ✅ 변경: MapScreen 대신 MapNavigator 사용
import MapNavigator from './mapNavigator';
import PlantingNavigator from './plantingNavigator';
import MyPageScreen from '../screens/Mypage/MypageScreen';

const Tab = createBottomTabNavigator();
const LABEL_COLOR = '#9AA0A6';
const renderLabel = (title: string) => () => (
  <Text style={{ fontSize: 13, fontWeight: '500', color: LABEL_COLOR }}>{title}</Text>
);

const BottomNavigationBar = ({ route }: any) => {
  return (
    <Tab.Navigator
      id="BottomTabs"                // ← CafeDetail에서 getParent('BottomTabs')로 잡습니다
      initialRouteName="Map"
      screenOptions={{
        tabBarStyle: { height: 80, paddingBottom: 10, paddingTop: 10 },
        tabBarActiveTintColor: LABEL_COLOR,
        tabBarInactiveTintColor: LABEL_COLOR,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapNavigator}     // ← 여기!
        initialParams={route?.params}
        options={{
          tabBarLabel: renderLabel('홈'),
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <HomeIconActive width={size * 1.2} height={size * 1.2} />
            ) : (
              <HomeIcon width={size * 1.2} height={size * 1.2} />
            ),
        }}
      />

      <Tab.Screen
        name="Plant"
        component={PlantingNavigator}
        options={{
          tabBarLabel: renderLabel('씨앗 심기'),
          tabBarIcon: ({ size, focused }) => (
            <View style={[styles.plantWrapper, { width: size * 2.0, height: size * 2.0 }]}>
              {focused && (
                <LinearGradient
                  colors={['rgba(108,223,68,0.55)', 'rgba(108,223,68,0)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  pointerEvents="none"
                  style={[styles.plantGlow, { width: size * 2.1, height: size * 1.6 }]}
                />
              )}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#AACFED', '#6CDF44']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBackground}
                >
                  <PlantIcon width={size * 1.5} height={size * 1.5} color="#FFFFFF" />
                </LinearGradient>
              </View>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: renderLabel('MY'),
          tabBarIcon: ({ size, focused }) =>
            focused ? (
              <MyPageIconActive width={size * 1.2} height={size * 1.2} />
            ) : (
              <MyPageIcon width={size * 1.2} height={size * 1.2} />
            ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  plantWrapper: { position: 'relative', marginBottom: 40, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { backgroundColor: 'transparent', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  gradientBackground: {
    width: 54, height: 54, borderRadius: 30, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#6CDF44', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  plantGlow: {
    position: 'absolute', bottom: -6, shadowColor: '#6CDF44', shadowOpacity: 0.2, shadowRadius: 10,
    borderRadius: 570, shadowOffset: { width: 0, height: 2 }, elevation: 8, zIndex: -1,
  },
});

export default BottomNavigationBar;

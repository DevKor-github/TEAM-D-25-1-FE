// src/navigations/bottomNavigationBar.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import MapScreen from '../screens/MapScreen';
import LinearGradient from 'react-native-linear-gradient';
import HomeIcon from '../assets/home.svg';
import PlantIcon from '../assets/plant.svg';
import MyPageIcon from '../assets/mypage.svg';

// ✅ 활성(클릭) 상태용 아이콘
import HomeIconActive from '../assets/clicked_home.svg';
import MyPageIconActive from '../assets/clicked_mypage.svg';

import { StyleSheet, View, Text } from 'react-native';
import PlantingNavigator from './plantingNavigator';
import MyPageScreen from '../screens/Mypage/MypageScreen';

const Tab = createBottomTabNavigator();

// 라벨 색 고정(변화 없음)
const LABEL_COLOR = '#9AA0A6';
const renderLabel = (title: string) => () => (
  <Text style={{ fontSize: 13, fontWeight: '500', color: LABEL_COLOR }}>{title}</Text>
);

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
        tabBarActiveTintColor: LABEL_COLOR,
        tabBarInactiveTintColor: LABEL_COLOR,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
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
            <View
              style={[
                styles.plantWrapper,
                { width: size * 2.0, height: size * 2.0 },
              ]}
              // 아이콘 전체를 기준으로 절대 배치를 하려면 relative 필수
            >
              {/* ✅ 포커스 시, 아이콘 아래쪽에 그라데이션 글로우 */}
              {focused && (
                <LinearGradient
                  colors={['rgba(108,223,68,0.55)', 'rgba(108,223,68,0)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  pointerEvents="none"
                  style={[
                    styles.plantGlow,
                    {
                      // 사이즈를 아이콘 크기에 맞춰 유동적으로
                      width: size * 2.1,
                      height: size * 1.6,
                    },
                  ]}
                />
              )}

              {/* 동그란 캡슐 버튼(항상 표시) */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#AACFED', '#6CDF44']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBackground}
                >
                  {/* 아이콘은 흰색 고정 */}
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
  // 포커스 시 글로우가 탭바에 비치도록, 약간 위로 띄워져 있는 버튼 래퍼
  plantWrapper: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 아이콘 캡슐 버튼
  iconContainer: {
    // 배경은 그라데이션 컴포넌트가 담당하므로 transparent
    backgroundColor: 'transparent',
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

    // 살짝 떠보이게 그림자(플랫폼 별도)
    shadowColor: '#6CDF44',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  // ✅ 아이콘 아래쪽에 깔리는 그라데이션 하이라이트
  plantGlow: {
    position: 'absolute',
    bottom: -6,        // 아이콘 아래쪽으로 살짝 내림
    shadowColor: '#6CDF44',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderRadius: 570,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    zIndex: -1,        // 아이콘 뒤쪽
  },

  headerTitleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
});

export default BottomNavigationBar;

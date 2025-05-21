import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import LinearGradient from 'react-native-linear-gradient';
import HomeIcon from '../assets/home.svg';
import PlantIcon from '../assets/plant.svg';
import MyPageIcon from '../assets/mypage.svg';
import {StyleSheet, View} from 'react-native';

const Tab = createBottomTabNavigator();

const BottomNavigationBar = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarStyle: {
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: '홈',
          tabBarIcon: ({color}) => <HomeIcon color={color} />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Planting"
        component={HomeScreen}
        options={{
          title: '씨앗 심기',
          tabBarIcon: ({color, size}) => (
            <View
              style={[
                styles.iconContainer,
                {width: size * 2.0, height: size * 2.0},
              ]}>
              <LinearGradient
                colors={['#AACFED', '#6CDF44']} // Apply your gradient colors
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.gradientBackground} // Apply the gradient background
              >
                <PlantIcon
                  color={color}
                  width={size * 1.5}
                  height={size * 1.5}
                />
              </LinearGradient>
            </View>
          ),
          tabBarActiveTintColor: '#00D100',
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={HomeScreen}
        options={{
          title: 'MY',
          tabBarIcon: ({color, size}) => <MyPageIcon color={color} />,
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
    width: 54, // Set width for the icon container (adjust size as needed)
    height: 54, // Set height for the icon container (adjust size as needed)
    borderRadius: 30, // Create a circle (half of width/height)
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomNavigationBar;

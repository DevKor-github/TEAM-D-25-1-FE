import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';
import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {getRestaruant} from '../apis/api/restaurant';
import {Restaurant} from '../types/restaruant';

const MapScreen = () => {
  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await getRestaruant();
      setRestaurantList(res as Restaurant[]);
    };
    fetchData();
  }, []);

  return (
    <View style={{flex: 1, width: '100%', height: '100%'}}>
      <NaverMapView
        style={{flex: 1}}
        initialCamera={{
          latitude: 37.58653559343726,
          longitude: 127.03184890085161,
          zoom: 15,
        }}>
        {restaurantList.map(restaurant => (
          <NaverMapMarkerOverlay
            key={restaurant.id}
            latitude={restaurant.latitude}
            longitude={restaurant.longitude}
            anchor={{x: 0.5, y: 1}}
            width={34}
            height={54}
            image={require('../assets/tree_example.png')}
          />
        ))}
      </NaverMapView>
    </View>
  );
};

export default MapScreen;

import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';
import {View} from 'react-native';

const MapScreen = () => {
  const markers = [
    {
      id: '1',
      latitude: 37.587479,
      longitude: 127.028872,
      image: require('../assets/tree.png'),
    },
    {
      id: '2',
      latitude: 37.583293,
      longitude: 127.028825,
      image: require('../assets/tree.png'),
    },
    {
      id: '3',
      latitude: 37.585877,
      longitude: 127.034402,
      image: require('../assets/tree.png'),
    },
  ];
  return (
    <View style={{flex: 1}}>
      <NaverMapView
        style={{flex: 1}}
        initialCamera={{
          latitude: 37.58653559343726,
          longitude: 127.03184890085161,
          zoom: 15,
        }}>
        {markers.map(marker => (
          <NaverMapMarkerOverlay
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            anchor={{x: 0.5, y: 1}}
            width={100}
            height={100}
            image={marker.image}
          />
        ))}
      </NaverMapView>
    </View>
  );
};

export default MapScreen;

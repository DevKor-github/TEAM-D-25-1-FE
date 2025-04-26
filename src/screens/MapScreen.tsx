import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';
import {View} from 'react-native';

const MapScreen = () => {
  return (
    <View style={{flex: 1}}>
      <NaverMapView
        style={{flex: 1}}
        initialCamera={{
          latitude: 37.58653559343726,
          longitude: 127.03184890085161,
          zoom: 15,
        }}>
        <NaverMapMarkerOverlay
          latitude={37.587479}
          longitude={127.028872}
          onTap={() => console.log(1)}
          anchor={{x: 0.5, y: 1}}
          width={100}
          height={100}
          image={require('../assets/tree.png')}></NaverMapMarkerOverlay>

        <NaverMapMarkerOverlay
          latitude={37.583293}
          longitude={127.028825}
          onTap={() => console.log(1)}
          anchor={{x: 0.5, y: 1}}
          width={100}
          height={100}
          image={require('../assets/tree.png')}></NaverMapMarkerOverlay>
      </NaverMapView>
    </View>
  );
};

export default MapScreen;

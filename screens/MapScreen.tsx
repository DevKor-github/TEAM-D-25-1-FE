import {NaverMapView} from '@mj-studio/react-native-naver-map';
import {View} from 'react-native';

const MapScreen = () => {
  return (
    <View style={{flex: 1}}>
      <NaverMapView
        style={{flex: 1}}
        initialCamera={{
          latitude: 37.586331295,
          longitude: 127.029230599,
          zoom: 10,
        }}
      />
    </View>
  );
};

export default MapScreen;

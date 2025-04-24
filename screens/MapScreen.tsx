import {NaverMapView} from '@mj-studio/react-native-naver-map';
import {View} from 'react-native';

const MapScreen = () => {
  return (
    <View style={{flex: 1}}>
      <NaverMapView style={{flex: 1}} />
    </View>
  );
};

export default MapScreen;

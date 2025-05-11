// screens/MapScreen.tsx
import NaverMapView from 'react-native-nmap';
import { View }      from 'react-native';

const MapScreen = () => {
  const initialLoction = {
  latitude: 37.586331295,
  longitude: 127.029230599,
  zoom: 16,
}
  return (
    <View style={{ flex: 1 }}>
      {/* 아래에 콘솔에 찍힌 그대로 정확히 복사한 Key를 넣어봅니다 */}
      <NaverMapView
        style={{ flex: 1 }}
        center={initialLoction}
      />
    </View>
  );
};

export default MapScreen;


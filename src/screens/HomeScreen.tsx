import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';
import {useEffect, useState} from 'react';
import {Modal, Text, TouchableOpacity, View} from 'react-native';
import {getRestaruant} from '../apis/api/restaurant';
import {Restaurant} from '../types/restaruant';

const MapScreen = ({navigation}: {navigation: any}) => {
  // 식당 목록 불럭오기
  const [restaurantList, setRestaurantList] = useState<Restaurant[]>([]);

  // 선택한 식당 상태 저장
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
            onTap={() => {
              setSelectedRestaurant(restaurant);
              setModalVisible(true);
            }}
          />
        ))}
      </NaverMapView>
      {selectedRestaurant && (
        <Modal
          transparent
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}>
            <View
              style={{
                position: 'absolute',
                bottom: 92,
                left: 0,
                right: 0,
                padding: 20,
                margin: 20,
                backgroundColor: 'white',
                borderRadius: 20,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 6},
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 3,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Detail', {
                    restaurant: selectedRestaurant,
                  });
                }}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                  {selectedRestaurant.name}
                </Text>
                <Text>{selectedRestaurant.address}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default MapScreen;

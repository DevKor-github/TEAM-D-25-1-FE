import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  Image,
} from 'react-native';
import {getTree, getTreeDetail} from '../apis/api/tree';
import {Tree} from '../types/tree';
import HamburgerIcon from '../assets/hamburger.svg';
import SearchIcon from '../assets/search.svg';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { typography }  from '../styles/typography'
import { getFollower } from '../apis/api/user';

const MapScreen = ({ navigation, route }: { navigation: any;  route: any}) => {
  // 식당 목록 불럭오기
  const [treeList, setTreeList] = useState<Tree[]>([]);

  // 선택한 식당 상태 저장
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [isNotificationVisible, setNotificationVisible] = useState(false);

  // 모달 상태 저장장
  const [modalVisible, setModalVisible] = useState(false);

  const [lon, setLon] = useState(127.03184890085161); // Initial longitude
  const [lat, setLat] = useState(37.58653559343726); // Initial latitude
  const [zoom, setZoom] = useState(15);

  const [user, setUser] = useState(); 
  const [profileImgURL, setProfileImgURL] = useState(); 

  useEffect(() => {
    const auth = getAuth(); // Get the auth instance once

    const unsubscribe = onAuthStateChanged(auth, async user => {
      // This callback runs whenever the auth state changes
      if (user) {
        // User is signed in
        try {
          const res = await getTree(lon.toString(), lat.toString()); // Your function call
          setTreeList(res as Tree[]);
          console.log(treeList);
        } catch (error) {
          console.error('식당 목록을 불러오지 못했습니다:', error);
        }
      } else {
        // No user is signed in
        console.warn('로그인된 사용자가 없습니다.');
        // You might want to navigate to a login screen or show a message here
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [lon, lat]);

  useEffect(() => {
    // navigation으로 넘어온 selectedRestaurant가 있으면
    if (route.params?.selectedRestaurant) {
      const restaurant = route.params.selectedRestaurant as Tree;

      setSelectedTree(restaurant);
      setLat(restaurant.latitude);
      setLon(restaurant.longitude);
      setModalVisible(true);
    }
  }, [route.params?.selectedRestaurant]);

  const handleTreePress = useCallback(async (item: Tree) => {
    setSelectedTree(item);
    setModalVisible(true);
    console.log('트리를 뽑아보겟서요');
    console.log(selectedTree);
    console.log(selectedTree?.images?.[0]);

    try {
      const treeId = item.treeId;
      const userId = treeId.split('_')[0];

      const userDetails = await getFollower(userId);

      setUser(userDetails.nickname);
      setProfileImgURL(userDetails.profileImage);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  const handleSearchClick = () => {
    navigation.navigate('Search');
  };

  const handleCloseCustomModal = () => {
    setModalVisible(false);
    setSelectedTree(null);
  };

  const onCameraChange = (e: any) => {
    setLat(e.latitude);
    setLon(e.longitude);
    setZoom(e.zoom);
  };

  const handleHamburgerPress = () => {
    setNotificationVisible(true);
    Alert.alert(
      '메뉴', // Title of the alert
      '햄버거 메뉴가 클릭되었습니다!', // Message of the alert
      [
        {
          text: '확인', // Text for the button
          onPress: () => console.log('확인 버튼 클릭'), // Optional callback when '확인' is pressed
        },
      ],
      {cancelable: true}, // Allows dismissing the alert by tapping outside
    );
  };
  const handleCloseNotification = () => {
    setNotificationVisible(false);
  };

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          position: 'absolute',
          //폰에 따라 달라야 할 것 같은데
          top: 70,
          left: 20,
          right: 20,
          backgroundColor: 'white',
          borderRadius: 50,
          paddingHorizontal: 15,
          paddingVertical: 10,
          zIndex: 1,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 3,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={handleHamburgerPress}>
            <View
              style={{
                marginLeft: 10,
                marginRight: 10,
              }}>
              <HamburgerIcon />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSearchClick}>
            <TextInput
              style={{fontSize: 16, color: 'gray', textAlign: 'center'}}
              placeholder="장소, 음식, 가게 검색"
              placeholderTextColor={typography.Inputbox_Placeholder_Big.color}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>
        <View style={{marginRight: 10}}>
          <SearchIcon />
        </View>
      </View>
      <NaverMapView
        style={{flex: 1}}
        initialCamera={{
          latitude: lat,
          longitude: lon,
          zoom: zoom,
        }}
        isShowScaleBar={false}
        isShowLocationButton={false}
        onCameraIdle={onCameraChange}>
        {treeList &&
          Array.isArray(treeList) &&
          treeList.map(tree => (
            <NaverMapMarkerOverlay
              key={tree.treeId}
              latitude={tree.latitude}
              longitude={tree.longitude}
              anchor={{x: 0.5, y: 1}}
              width={34}
              height={54}
              image={require('../assets/tree_example.png')}
              onTap={() => {
                handleTreePress(tree);
              }}
            />
          ))}
      </NaverMapView>
      {selectedTree && modalVisible && (
        <TouchableWithoutFeedback onPress={handleCloseCustomModal}>
          <View>
            <View
              // 스타일 정리리
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
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
                style={[styles.touchableCard, {alignItems: 'flex-start'}]}
                onPress={() => {
                  handleCloseCustomModal();
                  navigation.navigate('Detail', {
                    restaurant: selectedTree,
                  });
                }}>
                <View style={[styles.leftSection, {marginRight: 0}]}>
                  <Image
                    source={{uri: selectedTree?.images?.[0]}}
                    style={styles.placeImage}
                  />
                  {/* 여기에 3D 나무 이미지 또는 컴포넌트 추가 */}
                  <View style={styles.treePlaceholder} />
                </View>
                <View style={styles.rightSection}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.nameText}>{selectedTree.name}</Text>
                  </View>
                  <Text style={styles.addressText}>{selectedTree.address}</Text>
                  <View style={styles.userInfo}>
                    <Image
                        source={{uri: profileImgURL}}
                        style={styles.userProfileImage}
                      />
                      <Text style={styles.userNickname}>
                        {user}님이 심은 나무
                      </Text>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>
                        {selectedTree.recommendationCount} M
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{selectedTree.review}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
      <Modal
        visible={isNotificationVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseNotification}>
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={handleCloseNotification}>
          <View style={styles.notificationContainer}>
            <Text style={styles.title}>새 알림</Text>
            {/* 여기서 이미지처럼 알림 리스트를 넣으면 됩니다 */}
            <Text>
              - 해민님의 카페 브레스송의 아름드리 나무에 물을 주었어요.
            </Text>
            <Text>- 민쭈쭈님이 나를 팔로우하기 시작했어요.</Text>
            <Text>- 주웅님이 나를 팔로우하기 시작했어요.</Text>
            {/* 더 많은 알림들 */}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default MapScreen;
function auth() {
  throw new Error('Function not implemented.');
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
  },
  notificationContainer: {
    width: 300,
    backgroundColor: 'white',
    padding: 20,
    marginTop: 50,
    marginLeft: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    // 왼쪽에서 슬라이드로 뜨는 느낌을 주려면 애니메이션 더 추가 가능
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 3,
  },
  touchableCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    resizeMode: 'cover',
    //backgroundColor: 'green',
  },
  treePlaceholder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  rightSection: {
    flex: 1,
    marginLeft: 35,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 15,
  },
  genreText: {
    fontSize: 14,
    color: '#888',
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    
  },
  userProfileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: "red"
  },
  userNickname: {
    fontSize: 14,
    color: '#555',
  },
  distanceBadge: {
    backgroundColor: '#e6f3e6',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 10,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    marginBottom: 15,
  },
});

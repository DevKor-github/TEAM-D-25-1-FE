// src/screens/MapScreen.tsx
import {
  NaverMapView,
  NaverMapMarkerOverlay,
} from '@mj-studio/react-native-naver-map';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Image,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import {getTree} from '../apis/api/tree';
import {Tree} from '../types/tree';
import HamburgerIcon from '../assets/hamburger.svg';
import SearchIcon from '../assets/search.svg';
import BasicProfileIcon from '../assets/basic_profile.svg';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { typography }  from '../styles/typography';
import { getFollower, getUser, getMe } from '../apis/api/user'; // ✅ getMe 추가
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DRAWER_W = 0.85;

const MapScreen = ({ navigation, route }: { navigation: any;  route: any}) => {
  const insets = useSafeAreaInsets();

  // 지도/마커
  const [treeList, setTreeList] = useState<Tree[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [lon, setLon] = useState(127.03184890085161);
  const [lat, setLat] = useState(37.58653559343726);
  const [zoom, setZoom] = useState(15);

  // 마커 하단 카드(나무 주인) 표시용
  const [user, setUser] = useState<string | undefined>();
  const [profileImgURL, setProfileImgURL] = useState<string | undefined>();

  // 좌측 드로어
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideX = useRef(new Animated.Value(-1000)).current;

  // 드로어 프로필 카드 데이터
  const [nickname, setNickname] = useState<string>('');
  const [intro, setIntro] = useState<string>(''); // ✅ 빈 값으로 두고 UI에서 폴백 문구 처리
  const [myProfileImageUrl, setMyProfileImageUrl] = useState<string | null>(null); // ✅ 내 프로필 이미지
  const [avatarVer, setAvatarVer] = useState(0); // ✅ 이미지 캐시 버스터

  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [treeCount, setTreeCount] = useState<number>(0);

  const notifications = [
    { id: 'n1', text: '해인님이 카페 브레송의 아름드리 나무에 물을 주었어요.', time: '· 2시간' },
    { id: 'n2', text: '민쭈짱님이 나를 팔로우하기 시작했어요.', time: '· 2시간' },
    { id: 'n3', text: '주웅님이 나를 팔로우하기 시작했어요.', time: '· 4시간' },
    { id: 'n4', text: '해마루의 잭과콩나물이(가) 나무 3단계가 되었어요.', time: '· 1일' },
    { id: 'n5', text: '태현님이 해마루의 잭과콩나물에 물을 주었어요.', time: '· 1일' },
    { id: 'n6', text: 'SEIN님이 해마루의 잭과콩나물에 물을 주었어요.', time: '· 1일' },
    { id: 'n7', text: '특별식당의 소나무이(가) 나무 1단계가 되었어요.', time: '· 4일' },
  ];

  // 좌표 변화 시 식당 목록 로드
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async cur => {
      if (!cur) return;
      try {
        const res = await getTree(lon.toString(), lat.toString());
        setTreeList((res || []) as Tree[]);
      } catch (e) {
        console.error('식당 목록을 불러오지 못했습니다:', e);
      }
    });
    return unsubscribe;
  }, [lon, lat]);

  // 외부에서 특정 식당 선택해서 들어온 경우
  useEffect(() => {
    if (route.params?.selectedRestaurant) {
      const restaurant = route.params.selectedRestaurant as Tree;
      setSelectedTree(restaurant);
      setLat(restaurant.latitude);
      setLon(restaurant.longitude);
      setModalVisible(true);
    }
  }, [route.params?.selectedRestaurant]);

  // 드로어 열릴 때 내 프로필 & 카운트 로드
  useEffect(() => {
    if (drawerVisible) {
      (async () => {
        try {
          // ✅ 핵심: /users/me(코어) + /users/me/mypage(집계) 병행 호출
          const [meCore, mePage]: any[] = await Promise.all([
            getMe(),   // description, profileImageUrl 등
            getUser(), // follower/following/treeCount 등
          ]);

          // 닉네임
          const nick = meCore?.nickname ?? mePage?.nickname;
          if (nick) setNickname(nick);

          // 한줄소개 (설명)
          const desc = (typeof meCore?.description === 'string' ? meCore.description : mePage?.description) ?? '';
          setIntro((desc || '').trim());

          // 내 프로필 이미지 URL (키 변형 대응)
          const imgRaw =
            (meCore?.profileImageUrl ?? meCore?.profileImage ??
             mePage?.profileImageUrl ?? mePage?.profileImage ?? '');
          const img = typeof imgRaw === 'string' ? imgRaw.trim() : '';
          setMyProfileImageUrl(img.length ? img : null);
          setAvatarVer(v => v + 1); // 캐시 깨기

          // 카운트류
          if (typeof mePage?.followerCount === 'number') setFollowerCount(mePage.followerCount);
          if (typeof mePage?.followingCount === 'number') setFollowingCount(mePage.followingCount);
          if (typeof mePage?.treeCount === 'number') setTreeCount(mePage.treeCount);
        } catch (e) {
          console.warn('프로필 로드 실패(드로어):', e);
        }
      })();

      Animated.timing(slideX, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideX, {
        toValue: -1000,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [drawerVisible, slideX]);

  // 마커 탭 시 하단 카드용 유저 정보
  const handleTreePress = useCallback(async (item: Tree) => {
    setSelectedTree(item);
    setModalVisible(true);
    try {
      const treeId = item.treeId;
      const userId = treeId.split('_')[0];
      const userDetails = await getFollower(userId);
      setUser(userDetails.nickname);
      setProfileImgURL(userDetails.profileImage); // 서버 키명에 맞게 유지
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  const handleSearchClick = () => navigation.navigate('Search');
  const onCameraChange = (e: any) => { setLat(e.latitude); setLon(e.longitude); setZoom(e.zoom); };

  // ✅ 드로어 아바타 캐시 버스터 적용
  const myAvatarSrc = myProfileImageUrl
    ? { uri: myProfileImageUrl + (myProfileImageUrl.includes('?') ? '&' : '?') + 'v=' + avatarVer }
    : null;

  return (
    <View style={{flex: 1}}>
      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <View style={styles.searchLeftRow}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)} style={{paddingHorizontal: 6}}>
            <HamburgerIcon />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSearchClick} style={{flex: 1}}>
            <TextInput
              style={styles.searchInput}
              placeholder="장소, 음식, 가게를 검색해보세요!"
              placeholderTextColor={typography.Inputbox_Placeholder_Big.color}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>
        </View>
        <View style={{marginRight: 2}}>
          <SearchIcon width={27} height={27}/>
        </View>
      </View>

      {/* 지도 */}
      <NaverMapView
        style={{flex: 1}}
        initialCamera={{ latitude: lat, longitude: lon, zoom }}
        isShowScaleBar={false}
        isShowLocationButton={false}
        onCameraIdle={onCameraChange}
      >
        {Array.isArray(treeList) && treeList.map(tree => (
          <NaverMapMarkerOverlay
            key={tree.treeId}
            latitude={tree.latitude}
            longitude={tree.longitude}
            anchor={{x: 0.5, y: 1}}
            width={34}
            height={54}
            image={require('../assets/real_tree0_0.png')}
            onTap={() => handleTreePress(tree)}
          />
        ))}
      </NaverMapView>

      {/* 하단 카드 (선택한 식당) */}
      {selectedTree && modalVisible && (
        <TouchableWithoutFeedback onPress={() => { setModalVisible(false); setSelectedTree(null); }}>
          <View>
            <View style={styles.bottomCard}>
              <TouchableOpacity
                style={[styles.touchableCard, {alignItems: 'flex-start'}]}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Detail', { restaurant: selectedTree });
                }}
              >
                <View style={[styles.leftSection, {marginRight: 0}]}>
                  <Image source={{uri: selectedTree?.images?.[0]}} style={styles.placeImage}/>
                  <View style={styles.treePlaceholder} />
                </View>
                <View style={styles.rightSection}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.nameText}>{selectedTree.name}</Text>
                  </View>
                  <Text style={styles.addressText}>{selectedTree.address}</Text>
                  <View style={styles.userInfo}>
                    <Image source={{uri: profileImgURL}} style={styles.userProfileImage}/>
                    <Text style={styles.userNickname}>{user}님이 심은 나무</Text>
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>{selectedTree.recommendationCount} M</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{selectedTree.review}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* 좌측 드로어 */}
      <Modal
        visible={drawerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerBackdrop}>
          <Animated.View
            style={[
              styles.drawerPanel,
              { transform: [{ translateX: slideX }], paddingTop: insets.top + 12 }
            ]}
          >
            {/* 헤더 */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>내 프로필</Text>
              <TouchableOpacity onPress={() => setDrawerVisible(false)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                <Text style={styles.drawerClose}>×</Text>
              </TouchableOpacity>
            </View>

            {/* 프로필 카드 */}
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  {myAvatarSrc ? (
                    <Image source={myAvatarSrc} style={styles.avatarImg} />
                  ) : (
                    <BasicProfileIcon width={35} height={35} />
                  )}
                </View>
                <View style={{flex:1, marginLeft: 14}}>
                  <Text style={styles.profileName}>{nickname || '닉네임'}</Text>
                  <Text style={styles.profileSub}>
                    {intro?.trim()?.length ? intro : '한줄소개로 나를 표현해보세요!'}
                  </Text>
                  <View style={styles.profileDivider}/>
                  <View style={styles.statsRow}>
                    <View style={styles.statCol}>
                      <Text style={styles.statVal}>{treeCount}</Text>
                      <Text style={styles.statKey}>심은 나무</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={styles.statVal}>{followerCount}</Text>
                      <Text style={styles.statKey}>팔로워</Text>
                    </View>
                    <View style={styles.statCol}>
                      <Text style={styles.statVal}>{followingCount}</Text>
                      <Text style={styles.statKey}>팔로잉</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 새 소식 */}
            <Text style={styles.sectionTitle}>새 소식</Text>
            <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom: 24}} showsVerticalScrollIndicator={false}>
              {notifications.map(n => (
                <View key={n.id} style={styles.noticeRow}>
                  <View style={styles.noticeAvatar}/>
                  <View style={{flex:1}}>
                    <Text style={styles.noticeText}>
                      {n.text}
                      <Text style={styles.noticeTime}>{' '}{n.time}</Text>
                    </Text>
                  </View>
                  <View style={styles.noticeDot}/>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* 오른쪽 반투명 영역 클릭 시 닫힘 */}
          <TouchableOpacity style={styles.drawerRightBlank} activeOpacity={1} onPress={() => setDrawerVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  /* 검색 바 */
  searchBar: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    height: 50,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchLeftRow: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  searchInput: { fontSize: 16, color: '#999999', textAlign: 'left', paddingVertical: 0 },

  /* 하단 카드 */
  bottomCard: {
    position: 'absolute', bottom: 20, left: 0, right: 0, margin: 20,
    backgroundColor: 'white', borderRadius: 20,
    shadowColor: '#000', shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 3,
  },
  touchableCard: { flexDirection: 'row', alignItems: 'center' },
  leftSection: { width: 100, height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  placeImage: { width: '100%', height: '100%', borderTopLeftRadius: 15, borderBottomLeftRadius: 15, resizeMode: 'cover' },
  treePlaceholder: { position: 'absolute', width: '100%', height: '100%' },
  rightSection: { flex: 1, marginLeft: 15 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  nameText: { fontSize: 17, fontWeight: '500', marginRight: 8, marginTop: 15 },
  addressText: { fontSize: 14, color: '#555', marginBottom: 8 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  userProfileImage: { width: 24, height: 24, borderRadius: 12, marginRight: 6, backgroundColor: '#6CDF44' },
  userNickname: { fontSize: 14, color: '#555', fontWeight: '400' },
  distanceBadge: { backgroundColor: '#e6f3e6', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 8, marginLeft: 10 },
  distanceText: { fontSize: 12, fontWeight: 'bold', color: '#4CAF50' },
  reviewText: { fontSize: 14, color: '#555', marginTop: 5, marginBottom: 15 },

  /* 드로어 모달 */
  drawerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', flexDirection: 'row' },
  drawerPanel: {
    flexBasis: `${DRAWER_W * 100}%`,
    maxWidth: '86%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 18,
  },
  drawerRightBlank: { flex: 1 },

  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  drawerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  drawerClose: { fontSize: 26, lineHeight: 26, color: '#777' },

  /* 프로필 카드 */
  profileCard: { backgroundColor: '#F6F6F8', borderRadius: 16, padding: 14, marginBottom: 18 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#E7E7E7',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  // ✅ 드로어 아바타 이미지
  avatarImg: { width: '100%', height: '100%', borderRadius: 30, resizeMode: 'cover' },

  profileName: { fontSize: 18, fontWeight: '600', color: '#111' },
  profileSub: { marginTop: 6, color: '#4B4B4B', fontSize: 14 },
  profileDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#D4D4D4', marginTop: 10, marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '600', color: '#111' },
  statKey: { fontSize: 13, color: '#111', marginTop: 3 },

  /* 새 소식 리스트 */
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 10 },
  noticeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  noticeAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3E3E3', marginRight: 10 },
  noticeText: { fontSize: 15, color: '#222' },
  noticeTime: { fontSize: 14, color: '#9A9A9A' },
  noticeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#43D049', marginLeft: 8 },
});

export default MapScreen;

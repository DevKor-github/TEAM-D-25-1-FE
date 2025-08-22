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
import { getFollower, getUser, getMe } from '../apis/api/user';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DRAWER_W = 0.85;

/** 공통 오리진 후보 (드로어/모달 동일 규칙) */
const WEB_ORIGIN = 'https://groo.space';
const API_ORIGIN = 'https://api.groo.space';
const CDN_ORIGIN = 'https://d16lnvwz2az818.cloudfront.net';

/** 경로 합치기 */
const joinUrl = (base: string, path: string) =>
  base.replace(/\/+$/, '') + '/' + String(path || '').replace(/^\/+/, '');

/** 다양한 키명 대응해 프로필 이미지 경로 뽑기 */
const pickProfileImgUrl = (obj: any): string | null => {
  const cand = [
    obj?.profileImageUrl,
    obj?.profileImage,
    obj?.imageUrl,
    obj?.avatarUrl,
    obj?.avatar,
    obj?.profile_url,
    obj?.profile_image_url,
  ];
  const found = cand.find(v => typeof v === 'string' && v.trim().length > 0);
  return found ? found.trim() : null;
};

/** HEAD(실패 시 GET range)로 실제 image/* 인지 검증 */
const isImageUrl = async (url: string): Promise<boolean> => {
  try {
    const r1 = await fetch(url, { method: 'HEAD' as any });
    const ct1 = r1.headers.get('content-type') || r1.headers.get('Content-Type') || '';
    if (r1.ok && ct1.toLowerCase().startsWith('image/')) return true;
  } catch {}
  try {
    const r2 = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0', Accept: 'image/*' } });
    const ct2 = r2.headers.get('content-type') || r2.headers.get('Content-Type') || '';
    if (r2.ok && ct2.toLowerCase().startsWith('image/')) return true;
  } catch {}
  return false;
};

/** 후보 배열에서 처음으로 진짜 이미지인 URL 하나 고르기 */
const firstValidImage = async (cands: string[]): Promise<string | null> => {
  for (const u of cands) {
    if (await isImageUrl(u)) return u;
  }
  return null;
};

const MapScreen = ({ navigation, route }: { navigation: any;  route: any}) => {
  const insets = useSafeAreaInsets();

  // 지도/마커
  const [treeList, setTreeList] = useState<Tree[]>([]);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [lon, setLon] = useState(127.03184890085161);
  const [lat, setLat] = useState(37.58653559343726);
  const [zoom, setZoom] = useState(15);

  /** 공통 오리진(앱 시작 시 한 번 추출해서 공유) */
  const [staticOrigin, setStaticOrigin] = useState<string | null>(null);

  /** 모달(하단 카드 — 나무 주인) */
  const [ownerNickname, setOwnerNickname] = useState<string | undefined>();
  const [ownerProfileImageUrl, setOwnerProfileImageUrl] = useState<string | null>(null);
  const [ownerAvatarFailed, setOwnerAvatarFailed] = useState(false);
  const [ownerUrlCandidates, setOwnerUrlCandidates] = useState<string[]>([]);
  const [ownerIdx, setOwnerIdx] = useState(0);
  const [ownerVer, setOwnerVer] = useState(0); // 캐시버스터

  /** 좌측 드로어 */
  const [drawerVisible, setDrawerVisible] = useState(false);
  const slideX = useRef(new Animated.Value(-1000)).current;

  /** 드로어(내 정보) */
  const [nickname, setNickname] = useState<string>('');
  const [intro, setIntro] = useState<string>('');
  const [myProfileImageUrl, setMyProfileImageUrl] = useState<string | null>(null);
  const [myAvatarFailed, setMyAvatarFailed] = useState(false);
  const [avatarVer, setAvatarVer] = useState(0);

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

  /** 드로어/모달 공통: 상대경로를 절대URL 후보 배열로 변환 */
  const buildCandidates = useCallback((raw?: string | null) => {
    if (!raw) return [] as string[];
    const s = raw.trim();
    if (!s) return [] as string[];
    if (/^https?:\/\//i.test(s)) return [s]; // 이미 절대 URL
    // 동일한 우선순위: (있으면) staticOrigin → WEB → CDN → API
    const origins = [staticOrigin, WEB_ORIGIN, CDN_ORIGIN, API_ORIGIN].filter(Boolean) as string[];
    return origins.map(o => joinUrl(o, s));
  }, [staticOrigin]);

  // ── 데이터 로드 (목록) ─────────────────────────────────────────────────────
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

  // ✅ 앱 시작 시 내 정보로부터 절대 URL 하나 찾아서 staticOrigin 저장
  useEffect(() => {
    (async () => {
      try {
        const [meCore, mePage]: any[] = await Promise.all([getMe(), getUser()]);
        const abs = [
          meCore?.profileImageUrl,
          mePage?.profileImageUrl,
          mePage?.recapImageUrl,
        ].find((u: any) => typeof u === 'string' && /^https?:\/\//i.test(u));
        if (abs) {
          try { setStaticOrigin(new URL(abs).origin); } catch {}
        }
      } catch {}
    })();
  }, []);

  // 드로어 열릴 때 내 프로필 동기화
  useEffect(() => {
    if (!drawerVisible) {
      Animated.timing(slideX, {
        toValue: -1000, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true,
      }).start();
      return;
    }

    (async () => {
      try {
        const [meCore, mePage]: any[] = await Promise.all([getMe(), getUser()]);
        const nick = meCore?.nickname ?? mePage?.nickname;
        if (nick) setNickname(nick);

        const desc = (typeof meCore?.description === 'string' ? meCore.description : mePage?.description) ?? '';
        setIntro((desc || '').trim());

        // 오리진 갱신(있으면)
        const abs = [
          meCore?.profileImageUrl,
          mePage?.profileImageUrl,
          mePage?.recapImageUrl,
        ].find((u: any) => typeof u === 'string' && /^https?:\/\//i.test(u));
        if (abs) { try { setStaticOrigin(new URL(abs).origin); } catch {} }

        // 내 아바타 URL 결정
        const rawImg =
          meCore?.profileImageUrl ?? meCore?.profileImage ??
          mePage?.profileImageUrl ?? mePage?.profileImage ?? null;
        const mineCands = buildCandidates(rawImg);
        const mine = await firstValidImage(mineCands);
        setMyProfileImageUrl(mine);
        setMyAvatarFailed(!mine);
        setAvatarVer(v => v + 1);

        if (typeof mePage?.followerCount === 'number') setFollowerCount(mePage.followerCount);
        if (typeof mePage?.followingCount === 'number') setFollowingCount(mePage.followingCount);
        if (typeof mePage?.treeCount === 'number') setTreeCount(mePage.treeCount);
      } catch (e) {
        console.warn('프로필 로드 실패(드로어):', e);
      }
    })();

    Animated.timing(slideX, {
      toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, [drawerVisible, slideX, buildCandidates]);

  // ── 모달(하단 카드)도 동일 규칙 적용 ───────────────────────────────────────
  const handleTreePress = useCallback(async (item: Tree) => {
    setSelectedTree(item);
    setModalVisible(true);

    try {
      const treeId = item.treeId;
      const userId = treeId.split('_')[0];
      const userDetails = await getFollower(userId);

      setOwnerNickname(userDetails?.nickname);

      const raw = pickProfileImgUrl(userDetails);     // '/images/review/...' 가능
      const cands = buildCandidates(raw);             // ✅ 드로어와 동일 규칙
      setOwnerUrlCandidates(cands);
      setOwnerIdx(0);
      setOwnerAvatarFailed(false);                    // 이전 실패 상태 초기화

      // 후보들 중 실제 이미지 응답인 URL만 선택
      const good = await firstValidImage(cands);
      setOwnerProfileImageUrl(good);
      setOwnerAvatarFailed(!good);
      setOwnerVer(v => v + 1);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setOwnerAvatarFailed(true);
    }
  }, [buildCandidates]);

  const handleSearchClick = () => navigation.navigate('Search');
  const onCameraChange = (e: any) => { setLat(e.latitude); setLon(e.longitude); setZoom(e.zoom); };

  // 캐시 버스터
  const myAvatarSrc = myProfileImageUrl
    ? { uri: myProfileImageUrl + (myProfileImageUrl.includes('?') ? '&' : '?') + 'v=' + avatarVer }
    : null;
  const ownerAvatarSrc = ownerProfileImageUrl
    ? { uri: ownerProfileImageUrl + (ownerProfileImageUrl.includes('?') ? '&' : '?') + 'v=' + ownerVer }
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
                    {ownerAvatarSrc && !ownerAvatarFailed ? (
                      <Image
                        key={ownerAvatarSrc.uri}             // URL 변할 때 강제 리마운트
                        source={ownerAvatarSrc}
                        style={styles.userProfileImage}
                        onError={() => {
                          // 혹시 통과했는데도 로딩 실패하면 다음 후보 시도
                          const next = ownerIdx + 1;
                          if (next < ownerUrlCandidates.length) {
                            setOwnerIdx(next);
                            setOwnerProfileImageUrl(ownerUrlCandidates[next]);
                            setOwnerAvatarFailed(false);
                            setOwnerVer(v => v + 1);
                          } else {
                            setOwnerAvatarFailed(true);
                          }
                        }}
                      />
                    ) : (
                      <View style={[styles.userProfileImage, styles.userProfileFallback]}>
                        <BasicProfileIcon width={14} height={14} />
                      </View>
                    )}
                    <Text style={styles.userNickname}>{ownerNickname}님이 심은 나무</Text>
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
                  {myAvatarSrc && !myAvatarFailed ? (
                    <Image source={myAvatarSrc} style={styles.avatarImg} onError={() => setMyAvatarFailed(true)} />
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
  userProfileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
    backgroundColor: '#E6E6E6',
  },
  userProfileFallback: { alignItems: 'center', justifyContent: 'center' },
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

  /* 프로필 카드 (드로어) */
  profileCard: { backgroundColor: '#F6F6F8', borderRadius: 16, padding: 14, marginBottom: 18 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#E7E7E7',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
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

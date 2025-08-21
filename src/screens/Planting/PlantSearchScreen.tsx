// src/screens/Planting/PlantSearchScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import ArrowLeftIcon from '../../assets/arrow-left.svg';
import SearchIcon from '../../assets/search.svg';
import PinIcon from '../../assets/pinicon.svg';
import { NaverMapView, NaverMapMarkerOverlay } from '@mj-studio/react-native-naver-map';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { setRestaurantQuery, setSavedRestaurant } from '../../redux/seedPlantingSlice';
import { SavedRestaurantType } from '../../types/types';

import { getSearchRestaurants, getRestaurantDetail } from '../../apis/api/search';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectRestaurant = {
  id: string;
  placeId: string;
  name: string;
  address: string;
  lat?: number;
  lon?: number; // 서버에서 lon으로 올 수 있음
  lng?: number; // 정규화 후 사용
};

const HEADER_H = 64;

const PlantSearchScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const dispatch: AppDispatch = useDispatch();
  const { restaurantQuery } = useSelector((state: RootState) => state.seedPlanting);

  const [searchRestaurant, setSearchRestaurant] = useState<SelectRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<SelectRestaurant | null>(null);

  // 지도 상태
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 37.5665, lng: 126.978 });
  const [markerCoord, setMarkerCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(15);
  const mapRef = useRef<any>(null);

  // 검색 결과 로드
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!restaurantQuery) {
        setSearchRestaurant([]);
        return;
      }
      setLoading(true);
      try {
        const results = (await getSearchRestaurants(restaurantQuery)) as SelectRestaurant[] | any[];
        const normalized = (results || []).map((r: any) => ({
          ...r,
          lng: r?.lng ?? r?.lon, // 표준화
        }));
        setSearchRestaurant(normalized);
      } catch (e) {
        console.error('검색 실패:', e);
        setSearchRestaurant([]);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(t);
  }, [restaurantQuery]);

  const handleSearchInputChange = useCallback(
    (text: string) => dispatch(setRestaurantQuery(text)),
    [dispatch],
  );

  // 리스트 탭 → 상세 호출 → 지도 이동 & 핀 설정
  const handleItemPress = useCallback(async (item: SelectRestaurant) => {
    try {
      setSelectedRestaurant(item);

      const detail = await getRestaurantDetail(item.id);
      console.log('식당 디테일 =', detail);

      // 다양한 키에 대응(문자열일 수 있음)
      const latRaw = detail?.latitude ?? detail?.lat;
      const lngRaw = detail?.longitude ?? detail?.lng ?? detail?.lon;

      const lat = Number(latRaw);
      const lng = Number(lngRaw);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setMapCenter({ lat, lng });
        setMarkerCoord({ lat, lng });
        setMapZoom(16);
      } else {
        // 좌표가 없으면 핀 제거
        setMarkerCoord(null);
      }

      setIsModalVisible(true);
    } catch (e) {
      console.error('식당 상세 가져오기 실패:', e);
      setMarkerCoord(null);
      setIsModalVisible(true);
    }
  }, []);

  // 모달이 열리고 마커가 있으면 카메라 이동(호환 메서드)
  useEffect(() => {
    if (!isModalVisible || !markerCoord) return;
    const cam = { latitude: markerCoord.lat, longitude: markerCoord.lng, zoom: 20 };
    mapRef.current?.setCamera?.(cam);
    mapRef.current?.animateCamera?.(cam);
    mapRef.current?.moveCamera?.(cam);
  }, [isModalVisible, markerCoord]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleSelectPlace = useCallback(() => {
    if (!selectedRestaurant) return;
    const save: SavedRestaurantType = { id: selectedRestaurant.id, name: selectedRestaurant.name };
    dispatch(setSavedRestaurant(save));
    setIsModalVisible(false);
    navigation.navigate('PlantHome');
  }, [dispatch, navigation, selectedRestaurant]);

  const renderSearchItem = (item: SelectRestaurant) => (
    <TouchableOpacity key={item.id} style={styles.itemContainer} onPress={() => handleItemPress(item)}>
      <PinIcon />
      <View>
        <Text style={styles.keywordText}>{item.name}</Text>
        <Text style={styles.addressText}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* 헤더 */}
        <View style={styles.headerArea}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.iconBtnInBox}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <ArrowLeftIcon />
              </TouchableOpacity>

              <TextInput
                value={restaurantQuery}
                onChangeText={handleSearchInputChange}
                placeholder="장소, 가게 명, 음식 검색"
                placeholderTextColor="#9E9E9E"
                style={styles.searchInput}
                returnKeyType="search"
              />

              <View style={styles.iconBtnInBox}>
                <SearchIcon width={27} height={27} />
              </View>
            </View>
          </View>
        </View>

        {/* 결과 리스트 */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <Text style={styles.centerInfo}>로딩 중…</Text>
          ) : searchRestaurant.length === 0 ? (
            <Text style={styles.centerInfo}>검색 결과가 없습니다</Text>
          ) : (
            searchRestaurant.map(renderSearchItem)
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 모달 */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleCloseModal} />
          <View style={[styles.modalCard, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.mapCard}>
              <NaverMapView
                ref={mapRef}
                style={styles.map}
                camera={{ latitude: mapCenter.lat, longitude: mapCenter.lng, zoom: mapZoom }}
                isShowScaleBar={false}
                isShowLocationButton={false}
              >
                {markerCoord && (
                  <NaverMapMarkerOverlay
                    latitude={markerCoord.lat}
                    longitude={markerCoord.lng}
                    // 핀 크기, 이미지사용도 가능
                    width={25}         
                    height={31.5}
                    anchor={{ x: 0.5, y: 1 }}
                    caption={{ text: selectedRestaurant?.name ?? '', textSize: 11 }}
                  />
                )}
              </NaverMapView>
            </View>

            {selectedRestaurant && (
              <>
                <View style={styles.sheetTextBlock}>
                  <Text style={styles.bottomSheetTitle}>{selectedRestaurant.name}</Text>
                  <Text style={styles.bottomSheetDetail}>{selectedRestaurant.address}</Text>
                </View>

                <View style={styles.thumbRow}>
                  <View style={styles.thumb}>
                    <Text style={styles.thumbText}>텅~</Text>
                  </View>
                  <View style={styles.thumb}>
                    <Text style={styles.thumbText}>텅~</Text>
                  </View>
                  <View style={styles.thumb}>
                    <Text style={styles.thumbText}>텅~</Text>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity style={styles.bottomSheetButton} onPress={handleSelectPlace} activeOpacity={0.9}>
              <Text style={styles.bottomSheetButtonText}>이 장소 선택</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PlantSearchScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  headerArea: {
    height: HEADER_H,
    paddingHorizontal: 19,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F2',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBox: {
    flex: 1,
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtnInBox: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    marginHorizontal: 6,
  },
  list: { flex: 1, paddingHorizontal: 23 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  keywordText: { fontSize: 16, color: '#111111', marginBottom: 4, fontWeight: '600', paddingLeft: 4 },
  addressText: { fontSize: 14, color: '#767676', fontWeight: '400', paddingLeft: 4 },
  centerInfo: { textAlign: 'center', marginTop: 20, color: '#666' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  mapCard: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#EDEDED' },
  map: { width: '100%', height: 180 },

  sheetTextBlock: { marginTop: 16 },
  bottomSheetTitle: { fontSize: 20, fontWeight: '600', color: '#111' },
  bottomSheetDetail: { fontSize: 15, color: '#797979', marginTop: 6 },

  thumbRow: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  thumb: {
    width: '31%',
    height: 92,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbText: { fontSize: 17, color: '#A9A9A9', fontWeight: '700' },

  bottomSheetButton: {
    marginTop: 18,
    backgroundColor: '#6CDF44',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  bottomSheetButtonText: { color: '#111', fontSize: 15, fontWeight: '500' },
});

// src/screens/Planting/PlantSearchScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';

import ArrowLeftIcon from '../../assets/arrow-left.svg';
import SearchIcon from '../../assets/search.svg';
import PinIcon from '../../assets/pinicon.svg';
import { NaverMapView } from '@mj-studio/react-native-naver-map';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { setRestaurantQuery, setSavedRestaurant } from '../../redux/seedPlantingSlice';
import { SavedRestaurantType } from '../../types/types';

import { getSearchRestaurants } from '../../apis/api/search';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SelectRestaurant = {
  id: string;
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
};

const HEADER_H = 64;

const PlantSearchScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const dispatch: AppDispatch = useDispatch();
  const { restaurantQuery } = useSelector((state: RootState) => state.seedPlanting);

  const [searchRestaurant, setSearchRestaurant] = useState<SelectRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  // 모달 상태
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<SelectRestaurant | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!restaurantQuery) {
        setSearchRestaurant([]);
        return;
      }
      setLoading(true);
      try {
        const results = await getSearchRestaurants(restaurantQuery);
        setSearchRestaurant((results || []) as SelectRestaurant[]);
      } catch (e) {
        console.error('검색 실패:', e);
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

  const handleItemPress = useCallback((item: SelectRestaurant) => {
    setSelectedRestaurant(item);
    setIsModalVisible(true);
  }, []);

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
      {/* 상단 검색 헤더(고정) */}
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
              <SearchIcon width={27} height={27}/>
            </View>
          </View>
        </View>
      </View>

      {/* 결과 리스트(스크롤) */}
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

      {/* ===== 모달(스크롤 없음) ===== */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        {/* 어두운 배경 */}
        <View style={styles.modalBackdrop}>
          {/* 바깥 터치 닫기 */}
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleCloseModal} />
          {/* 하단 카드(고정 콘텐츠) */}
          <View style={[styles.modalCard, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.mapCard}>
              <NaverMapView
                style={styles.map}
                isShowScaleBar={false}
                isShowLocationButton={false}
              />
            </View>

            {selectedRestaurant && (
              <>
                <View style={styles.sheetTextBlock}>
                  <Text style={styles.bottomSheetTitle}>{selectedRestaurant.name}</Text>
                  <Text style={styles.bottomSheetDetail}>{selectedRestaurant.address}</Text>
                </View>

                {/* ▼▼▼ [수정] 썸네일 View 안에 Text 추가 ▼▼▼ */}
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

  /* ===== 헤더 & 검색 ===== */
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

  /* ===== 리스트 ===== */
  list: { flex: 1, paddingHorizontal: 23 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  keywordText: { fontSize: 16, color: '#111111', marginBottom: 4, fontWeight: '600', paddingLeft: 4, },
  addressText: { fontSize: 14, color: '#767676', fontWeight:400, paddingLeft: 4, },
  centerInfo: { textAlign: 'center', marginTop: 20, color: '#666' },

  /* ===== 모달 ===== */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end', // 화면 하단에 카드
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
  // ▼▼▼ [수정] thumb 스타일에 중앙 정렬 속성 추가 ▼▼▼ 
  thumb: {
    width: '31%',
    height: 92,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 썸네일 텍스트 스타일 추가 ▼▼▼ 텅~~ 이럼
  thumbText: {
    fontSize: 17,
    color: '#A9A9A9',
    fontWeight: '700',
  },

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
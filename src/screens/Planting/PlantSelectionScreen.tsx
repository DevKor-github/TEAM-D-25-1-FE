// src/screens/Planting/PlantSelectionScreen.tsx
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from 'react-native-gesture-handler';

import seedData from '../../data/seedData';
import {AppDispatch, RootState, SavedSeedType} from '../../types/types';
import {useDispatch, useSelector} from 'react-redux';
import {setSavedSeed} from '../../redux/seedPlantingSlice';

// ✅ 커스텀 백 아이콘
const backIcon = require('../../assets/arrow.png');

interface SelectSeed {
  seedId: number;
  name: string;
  image: ImageSourcePropType;
  description: string;
}

const PlantSelectionScreen = ({navigation}: {navigation: any}) => {
  const dispatch: AppDispatch = useDispatch();
  const {savedSeed} = useSelector((state: RootState) => state.seedPlanting);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalSeed, setModalSeed] = useState<SavedSeedType | null>(null);

  // ✅ 헤더: 좌측 커스텀 back, 중앙 타이틀, 우측 확인(선택 시만 활성색)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerTitle: '씨앗 선택',
      headerTitleAlign: 'center',
      headerTitleStyle: {fontSize: 19, fontWeight: '600', color: '#111'},

      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginLeft: 12, padding: 6}}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Image source={backIcon} style={{width: 24, height: 24, resizeMode: 'contain'}} />
        </TouchableOpacity>
      ),

      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (savedSeed) {
              navigation.goBack(); // 선택되어 있으면 그대로 돌아가기
            }
          }}
          style={{paddingRight: 20}}>
          <Text
            style={{
              color: savedSeed ? '#0DBC65' : '#999999',
              fontSize: 18,
              fontWeight: '600',
            }}>
            확인
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, savedSeed]);

  // 씨앗 카드 탭 → 상세 모달 오픈
  const handleSeedItemPress = useCallback((seed: SelectSeed) => {
    setModalSeed(seed);
    setIsModalVisible(true);
  }, []);

  // 모달 내 “이 씨앗 선택”
  const handleSelectSeedFromModal = useCallback(() => {
    if (modalSeed) {
      dispatch(setSavedSeed(modalSeed));
      setIsModalVisible(false);
      // 필요시 자동 복귀하려면 아래 주석을 해제
      // navigation.goBack();
    }
  }, [dispatch, modalSeed]);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setModalSeed(null);
  }, []);

  const renderSeedItem = (seed: SelectSeed) => (
    <TouchableOpacity
      key={seed.seedId}
      style={[styles.seedItem, savedSeed?.seedId === seed.seedId && styles.selectedSeedItem]}
      onPress={() => handleSeedItemPress(seed)}>
      <View style={styles.imageWrapper}>
        <Image source={seed.image} style={styles.seedImage} resizeMode="contain" />
      </View>
      <View style={styles.horizontalLine} />
      <View style={styles.seedNameContainer}>
        <Text style={styles.seedNameText}>{seed.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, padding: 20, backgroundColor: 'white'}}>
      <Text style={styles.headerTitle}>내 씨앗 모음</Text>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        {seedData.map(renderSeedItem)}
      </ScrollView>

      {/* 씨앗 상세 모달 */}
      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={handleCloseModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            {modalSeed && (
              <>
                <Text style={styles.modalTitle}>{modalSeed.name}</Text>
                <Text style={styles.modalDescription}>
                  {
                    seedData.find(s => s.seedId === modalSeed.seedId)
                      ?.description
                  }
                </Text>

                <Image
                  source={
                    seedData.find(s => s.seedId === modalSeed.seedId)
                      ?.image_description
                  }
                />

                <TouchableOpacity
                  style={styles.selectSeedButton}
                  onPress={handleSelectSeedFromModal}>
                  <Text style={styles.selectSeedButtonText}>이 씨앗 선택</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: {fontSize: 16, marginBottom: 10},

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  seedItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
  },
  selectedSeedItem: {
    backgroundColor: '#EEFFE0',
    borderColor: '#6CDF44',
    borderWidth: 2,
  },
  imageWrapper: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  seedImage: {width: '80%', height: '80%'},
  horizontalLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    width: '85%',
    alignSelf: 'center',
    marginBottom: 10,
  },
  seedNameContainer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  seedNameText: {fontSize: 14, fontWeight: '600'},

  // 모달
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  closeButton: {position: 'absolute', top: 15, right: 15, padding: 5},
  closeButtonText: {fontSize: 20, fontWeight: 'bold', color: '#888'},
  modalTitle: {fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333'},
  modalDescription: {fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#555', lineHeight: 24},
  selectSeedButton: {backgroundColor: '#6CDF44', borderRadius: 25, paddingVertical: 12, paddingHorizontal: 30, elevation: 2},
  selectSeedButtonText: {color: 'white', fontWeight: 'bold', fontSize: 18, textAlign: 'center'},
});

export default PlantSelectionScreen;

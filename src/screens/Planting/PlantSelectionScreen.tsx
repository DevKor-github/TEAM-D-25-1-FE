import {useCallback, useLayoutEffect, useState} from 'react';

import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from 'react-native-gesture-handler';

import seedData from '../../data/seedData';
import React from 'react';
import {AppDispatch, RootState, SeedType} from '../../types/types';
import {useDispatch, useSelector} from 'react-redux';
import {setSelectedSeed} from '../../redux/seedPlantingSlice';

const PlantSelectionScreen = ({navigation}: {navigation: any}) => {
  const dispatch: AppDispatch = useDispatch();
  const {selectedSeed} = useSelector((state: RootState) => state.seedPlanting);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalSeed, setModalSeed] = useState<SeedType | null>(null); // 모달에 표시될 씨앗 정보

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            // 선택된 씨앗이 있다면 PlantHome으로 이동하면서 파라미터로 전달
            if (selectedSeed) {
              console.log('씨앗을 선택해주세요.', selectedSeed);
              navigation.goBack();
            } else {
              // 씨앗을 선택하지 않고 확인을 누른 경우 처리 (예: 알림)
              console.log('씨앗을 선택해주세요.');
              // 선택하지 않고 '확인' 버튼을 누른 경우 PlantHome으로 아무 파라미터 없이 돌아갈 수도 있습니다.
              // navigation.navigate('PlantHome', {});
            }
          }}
          style={{paddingRight: 20}}>
          <Text style={selectedSeed && {color: 'green'}}>확인</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedSeed]); // selectedSeed가 변경될 때마다 헤더 버튼 로직이 업데이트되도록

  // 씨앗 항목 클릭 핸들러: 모달을 띄웁니다.
  const handleSeedItemPress = useCallback((seed: SeedType) => {
    setModalSeed(seed); // 모달에 표시할 씨앗 설정
    setIsModalVisible(true); // 모달 열기
  }, []);

  // 모달 내 "이 씨앗 선택" 버튼 핸들러
  const handleSelectSeedFromModal = useCallback(() => {
    if (modalSeed) {
      dispatch(setSelectedSeed(modalSeed)); // Redux 스토어에 씨앗 정보 디스패치
      setIsModalVisible(false); // 모달 닫기
      //navigation.goBack(); // 이전 화면(PlantScreen)으로 돌아가기
    }
  }, [dispatch, modalSeed, navigation]);

  // 모달 닫기 핸들러
  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setModalSeed(null); // 모달 닫을 때 모달 씨앗 정보 초기화
  }, []);

  // 씨앗 항목 렌더링 함수
  const renderSeedItem = (seed: SeedType) => (
    <TouchableOpacity
      key={seed.id}
      style={[
        styles.seedItem,
        selectedSeed?.id === seed.id && styles.selectedSeedItem, // Redux 상태에 따라 선택 스타일 적용
      ]}
      onPress={() => handleSeedItemPress(seed)} // 클릭 시 모달 띄우기
    >
      <View style={styles.imageWrapper}>
        <Image
          source={
            typeof seed.image === 'string' ? {uri: seed.image} : seed.image
          }
          style={styles.seedImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.horizontalLine} />
      <View style={styles.seedNameContainer}>
        <Text style={styles.seedNameText}>{seed.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleSeedSelect = (seed: SeedType) => {
    dispatch(setSelectedSeed(seed));
    console.log(`PlantSelectionScreen - Selected seed ID: ${seed.id}`);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
      }}>
      <Text style={styles.headerTitle}>내 씨앗 모음</Text>
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {seedData.map(seed =>
          renderSeedItem(
            seed,
            // <TouchableOpacity
            //   key={seed.id}
            //   style={[
            //     styles.seedItem,
            //     selectedSeed?.id === seed.id && styles.selectedSeedItem, // Apply selected style
            //   ]}
            //   onPress={() => handleSeedSelect(seed)}>
            //   <View style={styles.imageWrapper}>
            //     <Image
            //       source={seed.image}
            //       style={styles.seedImage}
            //       resizeMode="contain"
            //     />
            //   </View>
            //   <View style={styles.horizontalLine} />
            //   <View style={styles.seedNameContainer}>
            //     <Text style={styles.seedNameText}>{seed.name}</Text>
            //   </View>
            // </TouchableOpacity>
          ),
        )}
      </ScrollView>
      {/* 씨앗 상세 모달 */}
      <Modal
        animationType="fade" // 모달 애니메이션 타입
        transparent={true} // 배경 투명하게
        visible={isModalVisible} // 모달 가시성 상태
        onRequestClose={handleCloseModal} // Android 뒤로가기 버튼 처리
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* 모달 닫기 버튼 */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            {modalSeed && ( // modalSeed가 있을 때만 내용 표시
              <>
                <Text style={styles.modalTitle}>{modalSeed.name}</Text>
                {/* 스크린샷의 이미지와 성장 단계 이미지는 seedData에 포함되어야 합니다. */}
                {/* 예시: <Image source={modalSeed.detailImage} style={styles.modalDetailImage} /> */}
                <Text style={styles.modalDescription}>
                  {/* 여기에 씨앗 상세 설명 추가 (예: modalSeed.description) */}
                  참나무는 도토리가 열리는 나무예요. 느리게 자라지만 뿌리가 깊고
                  수백 년을 살 수 있을 만큼 오래 가요.
                </Text>
                {/* 성장 단계 이미지 (스크린샷 참고) */}
                <Image
                  source={require('../../assets/seed_growing.png')} // 실제 이미지 경로로 변경
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20, // Padding for the entire screen
  },
  headerTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute items evenly
    paddingBottom: 20, // Add some padding at the bottom for scrollability
  },
  seedItem: {
    width: '48%', // Roughly half width to get two columns, adjust for spacing
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    marginBottom: 15, // Space between rows
    overflow: 'hidden', // Ensures border radius is applied to children
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
  },
  selectedSeedItem: {
    backgroundColor: '#EEFFE0', // Light green background for selected item
    borderColor: '#6CDF44', // Green border for selected item
    borderWidth: 2, // Thicker border for selection emphasis
  },
  imageWrapper: {
    width: '100%',
    height: 150, // Fixed height for the image area
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  seedImage: {
    width: '80%', // Adjust image size within its container
    height: '80%',
  },
  horizontalLine: {
    height: 1, // 선의 두께
    backgroundColor: '#E0E0E0', // 선의 색상
    width: '85%', // 선의 너비 (seedItem 너비의 85%)
    alignSelf: 'center', // 중앙 정렬
    marginBottom: 10, // 선과 이름 사이의 간격
  },
  seedNameContainer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  seedNameText: {
    fontSize: 14,
    fontWeight: '600',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // 반투명 배경
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%', // 모달 너비 조정
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
    lineHeight: 24,
  },
  growthStageImage: {
    width: '100%', // 너비를 모달에 맞게 조정
    height: 80, // 높이 고정
    marginBottom: 20,
  },
  selectSeedButton: {
    backgroundColor: '#6CDF44', // 스크린샷의 초록색 버튼
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
  },
  selectSeedButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default PlantSelectionScreen;

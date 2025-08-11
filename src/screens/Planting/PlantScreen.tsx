import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';
import {
  setRestaurantQuery,
  setSavedRestaurant,
  setSavedSeed,
  addPhoto,
  setReviewText,
  resetSeedPlanting,
} from '../../redux/seedPlantingSlice';

import SearchIcon from '../../assets/search.svg';
import ArrowRightIcon from '../../assets/chevron-right.svg';
import CameraIcon from '../../assets/camera.svg';
import {useCallback, useLayoutEffect, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import React from 'react';

import BottomNavigationBar from '../../navigations/bottomNavigationBar';
import {SavedSeedType} from '../../types/types';

import * as ImagePicker from 'react-native-image-picker';
import {RootState} from '../../types/types';
import { postTree } from '../../apis/api/tree';
import Toast from 'react-native-toast-message';

const PlantScreen = ({navigation, route}: {navigation: any; route: any}) => {
  const dispatch = useDispatch();

  //const [reviewText, setReviewText] = useState(''); // 한줄평 텍스트 상태 관리
  //const [selectedPlaceName, setSelectedPlaceName] = useState(null);

  //const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  // const [addedImages, setAddedImages] = useState<string[]>([]); // 이미지 URI를 저장할 상태

  // Redux 스토어에서 상태 가져오기
  const {
    savedRestaurant, // 선택된 장소 객체 (name, address 등 포함)
    savedSeed, // 선택된 씨앗 객체
    savedTags,
    savedPhotos, // 추가된 이미지 URI 배열
    reviewText, // 한줄평 텍스트
  } = useSelector((state: RootState) => state.seedPlanting);

  // 모달 가시성 상태 관리
  const [isModalVisible, setModalVisible] = useState(false);

  // '확인' 버튼 활성화 여부 확인 savedRestaurant !== null && 추가하기
  const isConfirmEnabled = savedRestaurant !== null && savedSeed !== null;

  // 씨앗 심기 API 호출 함수
  const handlePlantSeed = async () => {
    console.log("handlePlant 호출");
    if (!savedSeed || !savedRestaurant) {
      
    return;
    }

    try {
      console.log('POST');
      const response = await postTree(
        savedSeed.seedId,
        savedRestaurant.id,
        reviewText,
        reviewText,
        savedTags,
      );
      Alert.alert('성공', '씨앗이 성공적으로 심어졌습니다!');
      console.log('API 응답:', response);

      // 성공 시 필요한 후속 작업 (예: 상태 초기화, 다른 화면으로 이동)
      dispatch(resetSeedPlanting()); // Redux 상태 초기화
      navigation.navigate('Home'); // 홈 화면으로 이동
    } catch (error) {
      Alert.alert('실패', '씨앗 심기에 실패했습니다. 다시 시도해주세요.');
      console.error('API 호출 중 에러 발생:', error);
    }
  };

  // 헤더 옵션 설정 (장소와 씨앗 선택 여부에 따라 '확인' 버튼 활성화/비활성화)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (isConfirmEnabled) {
              // 여기에 씨앗 심기 로직 또는 다음 화면으로 이동 로직 추가
              console.log('씨앗 심기 완료!');
              // 예시: 모든 상태 초기화 후 홈 화면으로 이동
              // dispatch(resetSeedPlanting());

              handlePlantSeed();
              navigation.navigate('Map');
            } else {
              console.log("");
            }
          }}
          style={{marginRight: 15}}>
          <Text
            style={{
              color: isConfirmEnabled ? '#4CAF50' : '#CCCCCC', // 활성화/비활성화 색상
              fontSize: 17,
              fontWeight: '600',
            }}>
            확인
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isConfirmEnabled, savedRestaurant, savedSeed]); // 의존성 배열에 상태 추가

  const handleAddPhoto = useCallback(() => {
    console.log('addphoth');
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo', // 사진만 선택
      includeBase64: false, // Base64 인코딩된 데이터는 포함하지 않음 (큰 파일에 비효율적)
      maxHeight: 200, // 최대 높이
      maxWidth: 200, // 최대 너비 (리사이징)
      quality: 1, // 이미지 품질 (0-1)
      selectionLimit: 0, // 0은 여러 개 선택 가능, 1은 한 개만 선택 가능
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log(
          'ImagePicker Error: ',
          response.errorCode,
          response.errorMessage,
        );
      } else if (response.assets && response.assets.length > 0) {
        const newImageUris = response.assets
          .map(asset => asset.uri)
          .filter(uri => uri !== undefined) as string[];
        if (newImageUris.length > 0) {
          newImageUris.forEach(uri => dispatch(addPhoto(uri)));
          console.log('선택된 이미지 URI:', newImageUris);
        }
      }
    });
  }, [dispatch]); // 의

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
      }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>장소 검색</Text>

        {savedRestaurant ? (
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => navigation.navigate('PlantSearch')}>
            <Text style={styles.selectFieldText}>{savedRestaurant?.name}</Text>
            {/* 오른쪽 화살표 아이콘 */}
            <SearchIcon width={20} height={20} color="#888" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => navigation.navigate('PlantSearch')}>
            <Text style={styles.selectFieldPlaceholder}>
              씨앗을 심을 장소를 검색해보세요.
            </Text>
            {/* 오른쪽 화살표 아이콘 */}
            <SearchIcon width={20} height={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>씨앗 고르기</Text>
        {savedSeed ? (
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => navigation.navigate('PlantSelection')}>
            <Text style={styles.selectFieldText}>{savedSeed.name}</Text>
            {/* 오른쪽 화살표 아이콘 */}
            <ArrowRightIcon width={20} height={20} color="#888" />
          </TouchableOpacity>
        ) : (
          // <View style={styles.selectField}>
          //   <Text style={styles.selectFieldText}>{selectedPlaceName}</Text>
          //   {/* 고정된 필드이므로 검색 아이콘은 표시하지 않습니다 */}
          // </View>
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => navigation.navigate('PlantSelection')}>
            <Text style={styles.selectFieldPlaceholder}>
              심을 씨앗의 종류를 골라봐요.
            </Text>
            {/* 오른쪽 화살표 아이콘 */}
            <ArrowRightIcon width={20} height={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>태그 달기</Text>
        <View style={styles.tagContainer}>
          {savedTags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addTagButton}
            onPress={() => navigation.navigate('TagSelection')}>
            <Text style={styles.plusIcon}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>사진</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageScrollContainer}>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}>
            <CameraIcon width={40} height={40} color="#B0B0B0" />
            <Text style={styles.addPhotoText}>사진 추가</Text>
          </TouchableOpacity>
          {savedPhotos.map((uri, index) => (
            <Image
              key={index.toString()}
              source={{uri}}
              style={styles.addedImage}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>한줄평</Text>
        <TextInput
          style={styles.reviewInput}
          placeholder="한줄평을 적을 수 있어요."
          placeholderTextColor="#888"
          multiline={true} // 여러 줄 입력 가능
          maxLength={80} // 최대 글자 수 제한
          value={reviewText}
          onChangeText={(text: string) => dispatch(setReviewText(text))}
        />
        <Text style={styles.charCount}>
          {reviewText.length} / {100}
        </Text>
      </View>

      {/* <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              장소와 씨앗을 모두 선택해주세요.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(!isModalVisible)}>
              <Text style={styles.modalButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20, // 각 섹션 하단 여백
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  // 장소 검색 스타일
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  searchIcon: {
    marginLeft: 10,
  },
  // 씨앗 고르기 스타일
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  selectFieldText: {
    fontSize: 14,
    color: '#333', // 플레이스홀더보다 진한 색상으로 고정된 텍스트임을 나타냅니다.
  },
  selectFieldPlaceholder: {
    fontSize: 14,
    color: '#888',
  },
  addPhotoButton: {
    width: 100, // 스크린샷과 유사한 크기
    height: 100,
    backgroundColor: '#F2F2F2',
    marginRight: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 5,
  },
  reviewInput: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 15,
    minHeight: 100, // 최소 높이
    textAlignVertical: 'top', // iOS, Android 모두 상단부터 시작
    fontSize: 14,
    color: '#333',
  },
  charCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 5,
  },
  imageScrollContainer: {
    flexDirection: 'row', // 가로 정렬
    alignItems: 'center', // 세로 중앙 정렬
  },
  addedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    flexShrink: 0, // 이미지 크기 고정
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },

  tagBadge: {
    backgroundColor: '#71E35F',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 4,
    marginBottom: 8,
  },

  tagText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '500',
  },

  addTagButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  plusIcon: {
    fontSize: 20,
    color: '#666',
    lineHeight: 20,
  },

  // 모달 스타일
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
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
});

export default PlantScreen;

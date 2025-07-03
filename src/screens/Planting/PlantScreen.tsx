import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useSelector, useDispatch} from 'react-redux';
import {
  setLocationQuery,
  setSelectedLocation,
  setSelectedSeed,
  addPhoto,
  setReviewText,
  resetSeedPlanting,
} from '../../redux/seedPlantingSlice';

import SearchIcon from '../../assets/search.svg';
import ArrowRightIcon from '../../assets/chevron-right.svg';
import CameraIcon from '../../assets/camera.svg';
import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import React from 'react';

import BottomNavigationBar from '../../navigations/bottomNavigationBar';
import {SeedType} from '../../types/types';

import * as ImagePicker from 'react-native-image-picker';
import {RootState} from '../../types/types';

const PlantScreen = ({navigation, route}: {navigation: any; route: any}) => {
  const dispatch = useDispatch();

  //const [reviewText, setReviewText] = useState(''); // 한줄평 텍스트 상태 관리
  //const [selectedPlaceName, setSelectedPlaceName] = useState(null);

  //const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  const [addedImages, setAddedImages] = useState<string[]>([]); // 이미지 URI를 저장할 상태

  // Redux 스토어에서 상태 가져오기
  const {
    locationQuery,
    selectedLocation, // 선택된 장소 객체 (name, address 등 포함)
    selectedSeed, // 선택된 씨앗 객체
    selectedPhotos, // 추가된 이미지 URI 배열
    reviewText, // 한줄평 텍스트
  } = useSelector((state: RootState) => state.seedPlanting);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // 화면이 포커스를 잃을 때 (즉, 다른 화면으로 이동할 때) 실행될 클린업 함수
  //     return () => {
  //       console.log('PlantScreen: 화면을 떠나며 상태 초기화');
  //       dispatch(resetSeedPlanting()); // Redux 상태 초기화 액션 디스패치
  //     };
  //   }, [route.params?.selectedSeed, dispatch]), // 의존성 배열
  // );

  // React.useEffect(() => {
  //   return () => {
  //     console.log('PlantScreen 언마운트됨'); // <-- 이 로그가 뜨는지 확인합니다.
  //   };
  // }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트/언마운트 시에만 실행

  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (route.params?.selectedLocation != undefined) {
  //       dispatch(route.params.selectedLocation);
  //       console.log(
  //         'PlantScreen - 선택된 장소:',
  //         route.params.selectedLocation,
  //       );
  //       // 장소 선택 후에는 params를 클리어하여 다음에 다시 이 화면으로 올 때
  //       // 이전 장소 정보가 남아있지 않도록 합니다 (필요시).
  //       // navigation.setParams({selectedPlace: undefined});
  //     }
  //     if (route.params?.selectedSeed != undefined) {
  //       // <-- 여기가 변경된 부분! selectedSeed 객체를 확인
  //       dispatch(route.params.selectedSeed); // selectedSeed 객체 전체를 저장
  //       console.log(
  //         'PlantScreen - 선택된 씨앗:',
  //         route.params.selectedSeed.name,
  //       );
  //       navigation.setParams({selectedPlace: undefined});
  //     }

  //     return () => {
  //       //   console.log('PlantScreen: 화면을 떠나며 상태 초기화');
  //       //   dispatch(resetSeedPlanting()); // Redux 상태 초기화 액션 디스패치
  //     };
  //   }, [route.params?.selectedPlace, route.params?.selectedSeed, dispatch]),
  // );

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
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
      }}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>장소 검색</Text>

        {selectedLocation ? (
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => navigation.navigate('PlantSearch')}>
            <Text style={styles.selectFieldText}>{selectedLocation?.name}</Text>
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
        {selectedSeed ? (
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => navigation.navigate('PlantSelection')}>
            <Text style={styles.selectFieldText}>{selectedSeed.name}</Text>
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
          {selectedPhotos.map((uri, index) => (
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
    </View>
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
});

export default PlantScreen;

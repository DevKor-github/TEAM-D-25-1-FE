import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ArrowLeftIcon from '../../assets/arrow-left.svg';
import SearchIcon from '../../assets/search.svg';
import PinIcon from '../../assets/pinicon.svg';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {AppDispatch, RootState} from '../../redux/store';
import {useDispatch, useSelector} from 'react-redux';
import {
  setRestaurantQuery,
  setSavedRestaurant,
} from '../../redux/seedPlantingSlice';
import {SavedRestaurantType} from '../../types/types';
import { getSearchRestaurants } from '../../apis/api/search'; // 경로는 맞게 수정


// SearchHistoryItem 타입 정의 (TypeScript 오류 해결)
interface SelectRestaurant {
  // id: number;
  // keyword: string;
  // genre: string;
  // address: string;
  id: string;
  placeId: string;
  name: string;
  address: string;
}

// const searchHistory: SearchHistoryItem[] = [
//   {
//     id: 1,
//     keyword: '달링스테이크',
//     genre: '스테이크, 립',
//     address: '서울특별시 성북구 고려대로 27길 9',
//   },
//   {
//     id: 2,
//     keyword: '달링스테이크',
//     genre: '스테이크, 립',
//     address: '서울특별시 성북구 고려대로 27길 9',
//   },
//   {
//     id: 3,
//     keyword: '달링스테이크',
//     genre: '스테이크, 립',
//     address: '서울특별시 성북구 고려대로 27길 9',
//   },
// ];

const PlantSearchScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
  }) => {
  
  const [searchRestaurant, setSearchRestaruant] = useState<SelectRestaurant[]>(
    [],
  );
  const [loading, setLoading] = useState(false);



  //const [value, onChangeText] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<SelectRestaurant | null>(null);
  const dispatch: AppDispatch = useDispatch(); // AppDispatch 타입 명시

  // Redux 스토어에서 검색어(locationQuery) 상태를 가져옵니다.
  const {restaurantQuery} = useSelector((state: RootState) => state.seedPlanting);


  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!restaurantQuery) {
        setSearchRestaruant([]); // 검색어 없을 경우 초기화
        return;
      }
      setLoading(true);
      try {
        const results = await getSearchRestaurants(restaurantQuery);
        setSearchRestaruant(results as SelectRestaurant[]); // API에서 받은 목록 저장
      } catch (error) {
        console.error('검색 결과 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSearchResults();
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
  }, [restaurantQuery]);


  //const initialSelectedSeed = route.params?.currentSelectedSeed;
  const handleSearchInputChange = useCallback(
    (text: string) => {
      dispatch(setRestaurantQuery(text)); // Redux 스토어의 locationQuery 업데이트
    },
    [dispatch],
  );
  const handleItemPress = useCallback((item: SelectRestaurant) => {
    setSelectedRestaurant(item);
    if (bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0); // BottomSheet를 첫 번째 스냅 포인트(25%)로 엽니다.
    }
  }, []);

  const handleSelectPlace = useCallback(() => {
    if (selectedRestaurant) {
      // 선택된 장소 정보를 Redux 스토어에 디스패치
      const RestaurantToSave: SavedRestaurantType = {
        name: selectedRestaurant.name,
        id: selectedRestaurant.id,
      };
      dispatch(setSavedRestaurant(RestaurantToSave)); // Redux 액션 디스패치
      console.log('Redux에 장소 저장:', RestaurantToSave);
      // BottomSheet 닫기
      if (bottomSheetRef.current) {
        bottomSheetRef.current.close();
      }

      // PlantScreen으로 돌아가기
      navigation.navigate('PlantHome'); // 'Plant'는 App.tsx에 정의된 PlantScreen의 name
    }
  }, [selectedRestaurant, dispatch, navigation]);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedRestaurant(null); // 선택된 항목 상태 초기화
  }, []);

  const renderSearchRestaurant = (item: SelectRestaurant) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}>
      <PinIcon />
      <View>
        <Text style={styles.keywordText}>{item.name}</Text>
        <Text style={styles.addressText}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
      }}>
      {/* TODO 서치바 컴포넌트화 */}
      <View
        style={{
          position: 'absolute',
          //폰에 따라 달라야 할 것 같은데
          top: 50,
          left: 20,
          right: 20,
          backgroundColor: 'white',
          borderRadius: 50,
          paddingHorizontal: 15,
          paddingVertical: 10,
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View
              style={{
                marginLeft: 10,
                marginRight: 10,
              }}>
              <ArrowLeftIcon />
            </View>
          </TouchableOpacity>

          <TextInput
            editable
            onChangeText={text => handleSearchInputChange(text)}
            value={restaurantQuery}
            style={{fontSize: 16, color: 'gray', textAlign: 'center'}}
            placeholder="장소, 음식, 가게 검색"
          />
        </View>
        <View style={{marginRight: 10}}>
          <SearchIcon />
        </View>
      </View>
      <View
        style={{
          height: 50,
          top: 110,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}></View>

      <View
        style={{
          top: 50,
          width: '100%',
          height: '80%',
        }}>
        {loading ? (
          <Text style={{textAlign: 'center', marginTop: 20}}>로딩 중...</Text>
        ) : searchRestaurant.length === 0 ? (
          <Text style={{textAlign: 'center', marginTop: 20}}>
            검색 결과가 없습니다
          </Text>
        ) : (
          searchRestaurant.map(item => renderSearchRestaurant(item))
        )}
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // -1 means closed initially
        snapPoints={['25%', '50%', '75%']} // Define snap points for the sheet height
        enablePanDownToClose={true} // Allow closing by swiping down
        onClose={handleCloseBottomSheet}
        backdropComponent={backdropProps => (
          <BottomSheetBackdrop
            {...backdropProps}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close" // ← 이게 핵심
          />
        )}>
        <BottomSheetView style={styles.bottomSheetContent}>
          {selectedRestaurant ? (
            <>
              <Text style={styles.bottomSheetTitle}>
                {selectedRestaurant.name}
              </Text>
              {/* <Text style={styles.bottomSheetDetail}>
                장르: {selectedRestaurant.genre}
              </Text> */}
              <Text style={styles.bottomSheetDetail}>
                주소: {selectedRestaurant.address}
              </Text>
              <TouchableOpacity
                style={styles.bottomSheetButton}
                onPress={handleSelectPlace}>
                <Text style={styles.bottomSheetButtonText}>이 장소 선택</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text>No item selected</Text>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: 'gray',
  },
  activeText: {
    color: 'black',
  },
  itemContainer: {
    flexDirection: 'row',
    alignContent: 'center',
    height: 75,
    paddingVertical: 15, // 각 아이템의 세로 패딩
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  keywordText: {
    marginLeft: 10,
    marginBottom: 5,
    fontSize: 16,
    color: '#333', // 어두운 글씨색
  },
  addressText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2A2A2A99', // 어두운 글씨색
  },
  activeIndicator: {
    backgroundColor: '#6CDF44', // 활성화된 탭의 바 색상
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  bottomSheetDetail: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  bottomSheetButton: {
    marginTop: 20,
    backgroundColor: '#6CDF44',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  bottomSheetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PlantSearchScreen;

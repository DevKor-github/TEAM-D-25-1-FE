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
import React, {useCallback, useRef, useState} from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

// SearchHistoryItem 타입 정의 (TypeScript 오류 해결)
interface SearchHistoryItem {
  id: number;
  keyword: string;
  genre: string;
  address: string;
}

const searchHistory: SearchHistoryItem[] = [
  {
    id: 1,
    keyword: '달링스테이크',
    genre: '스테이크, 립',
    address: '서울특별시 성북구 고려대로 27길 9',
  },
  {
    id: 2,
    keyword: '달링스테이크',
    genre: '스테이크, 립',
    address: '서울특별시 성북구 고려대로 27길 9',
  },
  {
    id: 3,
    keyword: '달링스테이크',
    genre: '스테이크, 립',
    address: '서울특별시 성북구 고려대로 27길 9',
  },
];

const PlantSearchScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const [value, onChangeText] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedItem, setSelectedItem] = useState<SearchHistoryItem | null>(
    null,
  );

  const initialSelectedSeed = route.params?.currentSelectedSeed;

  const handleItemPress = useCallback((item: SearchHistoryItem) => {
    setSelectedItem(item);
    if (bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(0); // BottomSheet를 첫 번째 스냅 포인트(25%)로 엽니다.
    }
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setSelectedItem(null); // 선택된 항목 상태 초기화
  }, []);

  const renderHistoryItem = (item: SearchHistoryItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}>
      <PinIcon />
      <View>
        <Text style={styles.keywordText}>{item.keyword}</Text>
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
            onChangeText={text => onChangeText(text)}
            value={value}
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
        {searchHistory.map(item => renderHistoryItem(item))}
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
          {selectedItem ? (
            <>
              <Text style={styles.bottomSheetTitle}>
                {selectedItem.keyword}
              </Text>
              <Text style={styles.bottomSheetDetail}>
                장르: {selectedItem.genre}
              </Text>
              <Text style={styles.bottomSheetDetail}>
                주소: {selectedItem.address}
              </Text>
              <TouchableOpacity
                style={styles.bottomSheetButton}
                onPress={() => {
                  // PlantScreen으로 돌아가면서 선택된 장소 이름을 전달합니다.
                  navigation.navigate('PlantHome', {
                    selectedPlace: selectedItem.keyword,
                    selectedSeed: initialSelectedSeed,
                  });
                }}>
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

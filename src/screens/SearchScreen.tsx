import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SearchIcon from '../assets/search.svg';
import ArrowLeftIcon from '../assets/arrow-left.svg'
import { useEffect, useState } from 'react';
import {getSearchRestaurants, getSearchUsers} from '../apis/api/search';

// SearchHistoryItem 타입 정의 (TypeScript 오류 해결)
interface SearchRestaurant {
  id: number;
  placeId: string;
  name: string;
  address: string;
}

interface SearchUser {
  id: number;
  username: string;
  nickname: string;
  profileImageUrl: string;
}


// const searchHistory = [
//   {id: 1, keyword: '카페', date: '05. 14.', icon: 'search-outline'},
//   {id: 2, keyword: '안암역', date: '05. 14.', icon: 'search-outline'},
//   {id: 3, keyword: '야마토텐동', date: '05. 14.', icon: 'location-outline'},
//   {id: 4, keyword: '한솔식당', date: '05. 12.', icon: 'location-outline'},
//   {id: 5, keyword: '종암동', date: '05. 12.', icon: 'search-outline'},
//   {id: 6, keyword: '카페 브레송', date: '05. 09.', icon: 'location-outline'},
// ];

// const searchChildren = [
//   {id: 1, keyword: '지수', date: '05. 14.', icon: 'search-outline'},
//   {id: 2, keyword: '태현', date: '05. 14.', icon: 'search-outline'},
//   {id: 3, keyword: '유나유나', date: '05. 14.', icon: 'location-outline'},
//   {id: 4, keyword: '돈까스킬러', date: '05. 12.', icon: 'location-outline'},
// ];

const SearchScreen = ({navigation}: {navigation: any}) => {
  const [value, onChangeText] = useState('');
  const [activeTab, setActiveTab] = useState('검색');


  const [searchRestaurants, setSearchRestaruants] = useState<SearchRestaurant[]>([]);
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  // const fetchResults = async () => {
  //   if (!value.trim()) {
  //     setSearchRestaruants([]);
  //     setSearchUsers([]);
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     if (activeTab === '검색') {
  //       const data = await getSearchRestaurants(value, 1, 10);
  //       setSearchRestaruants(data as SearchRestaurant[]);
  //     } else {
  //       const data = await getSearchUsers(value, 1, 10);
  //       setSearchUsers(data as SearchUser[]);
  //     }
  //   } catch (e) {
  //     console.error('검색 실패:', e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    const fetchResults = async () => {
      if (!value) {
        setSearchRestaruants([]);
        setSearchUsers([]);
        return;
      }
      setLoading(true);
      try {
        if (activeTab === '검색') {
          const data = await getSearchRestaurants(value, 1,10);
          setSearchRestaruants(data as SearchRestaurant[]);
        } else {
          const data = await getSearchUsers(value, 1, 10);
          setSearchUsers(data as SearchUser[]);
        }
      } catch (e) {
        console.error('검색 실패:', e);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300); // debounce 처리

    return () => clearTimeout(debounce);
  }, [value, activeTab]);

  const tabPress = (tabName: string) => {
    setActiveTab(tabName);
  };

  const renderRestaurant = (item: SearchRestaurant) => (
    <TouchableOpacity key={item.id} style={styles.itemContainer}>
      {/* 검색어 텍스트 */}
      <Text style={styles.keywordText}>{item.name}</Text>

      {/* 날짜와 삭제 아이콘 영역 */}
      <View style={styles.rightContentContainer}>
        <Text style={styles.dateText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUser = (item: SearchUser) => (
    <TouchableOpacity key={item.id} style={styles.itemContainer}>
      {/* 검색어 텍스트 */}
      <Text style={styles.keywordText}>{item.nickname}</Text>

      {/* 날짜와 삭제 아이콘 영역 */}
      <View style={styles.rightContentContainer}>
        <Text style={styles.dateText}>{item.nickname}</Text>
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
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}>
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
        <SearchIcon />
      </View>
      <View
        style={{
          height: 50,
          top: 110,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
          }}
          onPress={() => tabPress('검색')}>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text
              style={[styles.text, activeTab === '검색' && styles.activeText]}>
              검색
            </Text>
          </View>
          <View
            style={[
              styles.indicator,
              activeTab === '검색' && styles.activeIndicator,
            ]}></View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',
          }}
          onPress={() => tabPress('친구')}>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text
              style={[styles.text, activeTab === '친구' && styles.activeText]}>
              친구
            </Text>
          </View>
          <View
            style={[
              styles.indicator,
              activeTab === '친구' && styles.activeIndicator,
            ]}></View>
        </TouchableOpacity>
      </View>
      {activeTab === '검색' && (
        <View
          style={{
            top: 120,
            width: '100%',
            height: '80%',
          }}>
          {searchRestaurants.map(item => renderRestaurant(item))}
        </View>
      )}
      {activeTab === '친구' && (
        <View
          style={{
            top: 120,
            width: '100%',
            height: '80%',
          }}>
          {searchUsers.map(item => renderUser(item))}
        </View>
      )}
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
    alignItems: 'center',
    paddingVertical: 12, // 각 아이템의 세로 패딩
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0', // 연한 구분선
  },
  keywordText: {
    flex: 1, // 남은 공간을 채우도록 flex: 1
    fontSize: 16,
    color: '#333', // 어두운 글씨색
  },
  rightContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#777', // 날짜 글씨색
    marginRight: 15, // 날짜와 삭제 아이콘 사이 간격
  },

  indicator: {
    height: 2,
    backgroundColor: 'transparent', // 기본적으로 숨김
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  activeIndicator: {
    backgroundColor: '#6CDF44', // 활성화된 탭의 바 색상
  },
});

export default SearchScreen;

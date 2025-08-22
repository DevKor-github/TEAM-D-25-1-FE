// src/screens/SearchScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  SafeAreaView, // ◀ SafeAreaView로 변경하는 것을 권장합니다.
  KeyboardAvoidingView, // ◀ KeyboardAvoidingView 추가
  Platform,             // ◀ Platform 추가
} from 'react-native';
import SearchIcon from '../assets/search.svg';
import ArrowLeftIcon from '../assets/arrow-left.svg';
import { getSearchRestaurants, getSearchUsers } from '../apis/api/search';
import PinIcon from '../assets/pinicon.svg';

// Types
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

const SEARCH_BOX_TOP = 70;
const TABS_TOP       = 128;
const LIST_TOP       = 170;

const SearchScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const [value, onChangeText] = useState('');
  const [activeTab, setActiveTab] = useState<'검색' | '친구'>('검색');

  const [searchRestaurants, setSearchRestaurants] = useState<SearchRestaurant[]>([]);
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!value) {
        setSearchRestaurants([]);
        setSearchUsers([]);
        return;
      }
      setLoading(true);
      try {
        if (activeTab === '검색') {
          const data = await getSearchRestaurants(value);
          setSearchRestaurants((data || []) as SearchRestaurant[]);
        } else {
          const data = await getSearchUsers(value);
          setSearchUsers((data || []) as SearchUser[]);
        }
      } catch (e) {
        console.error('검색 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(fetchResults, 300); // debounce
    return () => clearTimeout(t);
  }, [value, activeTab]);

  const handleRestaurantPress = (item: SearchRestaurant) => {
    navigation.navigate('Map', { selectedRestaurant: item });
  };
  const handleUserPress = (item: SearchUser) => {
    navigation.navigate('Friend', { selectedUser: item });
  };

  const renderRestaurant = (item: SearchRestaurant) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemContainer}
      onPress={() => handleRestaurantPress(item)}
    >
      <PinIcon />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.keywordText}>{item.name}</Text>
        <Text style={styles.addressText}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUser = (item: SearchUser) => (
    <TouchableOpacity
      key={item.id}
      style={styles.itemContainer}
      onPress={() => handleUserPress(item)}
    >
      <Text style={[styles.keywordText, { marginLeft:2 }]}>{item.nickname}</Text>
    </TouchableOpacity>
  );

  const placeholderText =
    activeTab === '검색'
      ? isInputFocused ? '' : '장소, 음식, 가게를 검색해보세요'
      : isInputFocused ? '' : '친구를 검색해보세요';

  return (
    // 최상단 View를 SafeAreaView로 변경하는 것을 권장합니다.
    <SafeAreaView style={styles.root}>
      {/* 검색바 (고정) - 변경 없음 */}
      <View style={styles.searchBarWrap}>
        <View style={styles.searchBarRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeftIcon />
          </TouchableOpacity>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholderText}
            placeholderTextColor="#9E9E9E"
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            style={styles.searchInput}
            returnKeyType="search"
          />
          <View style={styles.iconBtn}>
            <SearchIcon width={27} height={27} />
          </View>
        </View>
      </View>

      {/* 탭 (고정) - 변경 없음 */}
      <View style={styles.tabs}>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('검색')}>
          <View style={styles.tabInner}>
            <Text style={[styles.tabText, activeTab === '검색' && styles.tabTextActive]}>검색</Text>
          </View>
          <View style={[styles.indicator, activeTab === '검색' && styles.activeIndicator]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabBtn} onPress={() => setActiveTab('친구')}>
          <View style={styles.tabInner}>
            <Text style={[styles.tabText, activeTab === '친구' && styles.tabTextActive]}>친구</Text>
          </View>
          <View style={[styles.indicator, activeTab === '친구' && styles.activeIndicator]} />
        </TouchableOpacity>
      </View>

      {/* ▼▼▼ 리스트 영역을 KeyboardAvoidingView로 감쌉니다. ▼▼▼ */}
      <KeyboardAvoidingView 
        style={styles.listContainer} // ◀ 기존 scrollList 스타일을 여기에 적용
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1 }} // ◀ KeyboardAvoidingView 내부를 꽉 채우도록
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <Text style={styles.centerInfo}>로딩 중…</Text>
          ) : activeTab === '검색' ? (
            searchRestaurants.length ? (
              searchRestaurants.map(renderRestaurant)
            ) : (
              <Text style={styles.centerInfo}>검색 결과가 없습니다</Text>
            )
          ) : searchUsers.length ? (
            searchUsers.map(renderUser)
          ) : (
            <Text style={styles.centerInfo}>검색 결과가 없습니다</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  /* 검색바 */
  searchBarWrap: {
    position: 'absolute',
    top: SEARCH_BOX_TOP,
    left: 20,
    right: 20,
    zIndex: 2, // ◀ 다른 요소 위에 있도록 zIndex 추가
  },
  searchBarRow: {
    height: 48,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
    paddingVertical: 0,
    textAlign: 'left',
  },
  /* 탭 */
  tabs: {
    position: 'absolute',
    top: TABS_TOP,
    left: 20,
    right: 20,
    height: 40,
    flexDirection: 'row',
    zIndex: 2, // ◀ 다른 요소 위에 있도록 zIndex 추가
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
  },
  tabInner: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 16.5,
    color: '#999999',
  },
  tabTextActive: {
    color: 'black',
    fontWeight: '500',
  },
  indicator: {
    height: 2,
    backgroundColor: 'transparent',
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  activeIndicator: {
    backgroundColor: '#6CDF44',
  },

  /* ▼▼▼ 리스트 컨테이너(KeyboardAvoidingView) 스타일 ▼▼▼ */
  listContainer: {
    position: 'absolute',
    top: LIST_TOP,
    left: 20,
    right: 20,
    bottom: 0,
  },
  listContent: {
    paddingBottom: 26,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  keywordText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#2A2A2A99',
  },
  centerInfo: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
// src/screens/SearchScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
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

const SEARCH_BOX_TOP = 70;   // 검색바 Y
const TABS_TOP       = 128;  // 탭 Y (검색바 바로 아래)
const LIST_TOP       = 170;  // 리스트 시작 Y (탭 바로 아래)

const SearchScreen = ({ navigation }: { navigation: any }) => {
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
    <View style={styles.root}>
      {/* 검색바 (고정) */}
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

      {/* 탭 (고정) */}
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

      {/* 리스트 (스크롤) */}
      <ScrollView
        style={styles.scrollList}
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
    </View>
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

  /* 리스트 (스크롤 영역) */
  scrollList: {
    position: 'absolute',
    top: LIST_TOP,
    left: 20,
    right: 20,
    bottom: 0, // 하단까지 꽉 채워 스크롤 가능
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

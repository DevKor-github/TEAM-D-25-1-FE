// src/screens/Planting/TagSelectionScreen.tsx
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setSavedTags} from '../../redux/seedPlantingSlice';
import {RootState} from '../../types/types';

const backIcon = require('../../assets/arrow.png');

const recommendedTags = [
  'DRINKER',
  'VEGAN_OR_VEGETARIAN',
  'SPICY_FOOD_LOVER',
  'PICKY_EATER',
  'DESSERT_LOVER',
  'DIETER',
  'LATE_NIGHT_EATER',
  'SWEET_TOOTH',
  'HEALTH_CONSCIOUS',
  'VALUE_SEEKER',
  'MEAT_LOVER',
  'DIET_PLANNER',
  'CAFFEINE_ADDICT',
  'CLASSIC_TASTE',
  'STREET_FOOD_FAN',
  'TTEOKBOKKI_LOVER',
  'SMALL_EATER',
  'BIG_EATER',
  'SOLO_DINER',
  'SEAFOOD_LOVER',
  'HEARTY_EATER',
];

const TagSelectionScreen = ({navigation}: {navigation: any}) => {
  const dispatch = useDispatch();
  const {savedTags} = useSelector((state: RootState) => state.seedPlanting);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');

  useEffect(() => {
    setSelectedTags(savedTags || []);
  }, [savedTags]);

  const handleSave = () => {
    dispatch(setSavedTags(selectedTags));
    navigation.goBack();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      headerTitle: '태그 선택',
      headerTitleAlign: 'center',
      headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#111' },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 12, padding: 6 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image source={backIcon} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{ paddingRight: 20 }}>
          <Text style={{ color: '#0DBC65', fontSize: 18, fontWeight: '600' }}>확인</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const addInputTag = () => {
    const trimmed = inputTag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags(prev => [...prev, trimmed]);
    }
    setInputTag('');
  };

  return (
    <View style={styles.container}>
      {/* 필요 시 직접 입력 UI
      <Text style={styles.description}>이 맛집을 설명하는 태그를 입력하세요.</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputTag}
          onChangeText={setInputTag}
          placeholder="한식, 가성비, 혼밥 등"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.inputAddBtn} onPress={addInputTag}>
          <Text style={styles.inputAddText}>＋</Text>
        </TouchableOpacity>
      </View>
      */}

      <View style={styles.listcontainer}>
        <Text style={styles.recommendTitle}>추천 태그</Text>

        <ScrollView contentContainerStyle={styles.chipContainer}>
          {recommendedTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.chip, isSelected && styles.chipSelected]}>
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default TagSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },

  // (옵션) 입력줄
  description: { fontSize: 14, color: '#444', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1, borderColor: '#DDD', borderRadius: 8,
    marginBottom: 16,
  },
  input: { flex: 1, height: 44, paddingHorizontal: 12, color: '#111' },
  inputAddBtn: {
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    borderLeftWidth: 1, borderLeftColor: '#DDD',
  },
  inputAddText: { fontSize: 20, color: '#888' },

  listcontainer: { flex: 1 },
  recommendTitle: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8 },

  // ✅ 요청하신 칩 스타일
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 4 },
  chip: {
    paddingHorizontal: 17, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: '#B9B9B9', margin: 4, backgroundColor: '#FFF'
  },
  chipText: { fontSize: 15, color: '#333' },

  // 선택 상태(강조)
  chipSelected: {
    backgroundColor: '#6CDF44',
    borderColor: '#6CDF44',
  },
  chipTextSelected: {
    color: '#111',
    fontWeight: '400',
  },
});

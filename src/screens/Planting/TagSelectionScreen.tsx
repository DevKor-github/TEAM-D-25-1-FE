import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setSavedTags} from '../../redux/seedPlantingSlice';
import {RootState} from '../../types/types';

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={{paddingRight: 20}}>
          <Text style={{color: 'green'}}>확인</Text>
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

  const handleSave = () => {
    dispatch(setSavedTags(selectedTags));
    console.log('Saved Tags:', selectedTags); // 🔍 확인용 로그
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.description}>
        이 맛집을 설명하는 태그를 입력하세요.
      </Text>

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
      </View> */}

      <View style={styles.listcontainer}>
        <Text style={styles.recommendTitle}>추천 태그</Text>
        <ScrollView contentContainerStyle={styles.recommendContainer}>
          {recommendedTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[styles.tag, isSelected && styles.selectedTag]}>
                <Text
                  style={[
                    styles.tagText,
                    isSelected && styles.selectedTagText,
                  ]}>
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
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    color: '#111',
  },
  inputAddBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#DDD',
  },
  inputAddText: {
    fontSize: 20,
    color: '#888',
  },
  listcontainer: {
    flex: 1,
  },
  recommendTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 40,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  selectedTag: {
    backgroundColor: '#6FCF97',
  },
  tagText: {
    color: '#444',
    fontSize: 14,
  },
  selectedTagText: {
    fontWeight: 'bold',
    color: '#fff',
  },
});

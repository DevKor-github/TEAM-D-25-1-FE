import {useLayoutEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from 'react-native-gesture-handler';

import seedData from '../../data/seedData';
import React from 'react';
import {SeedType} from '../../types/types';

const PlantSelectionScreen = ({navigation}: {navigation: any}) => {
  const [selectedSeed, setSelectedSeed] = useState<SeedType | null>(null);
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            // 선택된 씨앗이 있다면 PlantHome으로 이동하면서 파라미터로 전달
            if (selectedSeed) {
              console.log('씨앗을 선택해주세요.', selectedSeed);
              navigation.navigate('PlantHome', {
                selectedSeed: selectedSeed, // <-- 여기서 직접 객체를 PlantHome으로 전달
              });
            } else {
              // 씨앗을 선택하지 않고 확인을 누른 경우 처리 (예: 알림)
              console.log('씨앗을 선택해주세요.');
              // 선택하지 않고 '확인' 버튼을 누른 경우 PlantHome으로 아무 파라미터 없이 돌아갈 수도 있습니다.
              // navigation.navigate('PlantHome', {});
            }
          }}
          style={{paddingRight: 20}}>
          <Text>확인</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, selectedSeed]); // selectedSeed가 변경될 때마다 헤더 버튼 로직이 업데이트되도록

  const handleSeedSelect = (seed: SeedType) => {
    setSelectedSeed(seed);
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
        {seedData.map(seed => (
          <TouchableOpacity
            key={seed.id}
            style={[
              styles.seedItem,
              selectedSeed?.id === seed.id && styles.selectedSeedItem, // Apply selected style
            ]}
            onPress={() => handleSeedSelect(seed)}>
            <View style={styles.imageWrapper}>
              <Image
                source={seed.image}
                style={styles.seedImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.horizontalLine} />
            <View style={styles.seedNameContainer}>
              <Text style={styles.seedNameText}>{seed.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
});

export default PlantSelectionScreen;

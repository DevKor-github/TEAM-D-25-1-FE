// src/components/CommentBubble.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import BasicProfileIcon from '../assets/basic_profile.svg';

type Props = {
  name: string;
  text: string;
  style?: ViewStyle; 
  avatar?: string;
};


export default function CommentBubble({ name, text, style, avatar }: Props) {
  
  console.log(avatar);
  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* ▼▼▼ 이 View가 실제 콘텐츠를 감싸고, 부모인 container에 의해 중앙 정렬됩니다. ▼▼▼ */}
      <View style={styles.contentWrapper}>
        {avatar ? (
          <Image source={{uri: avatar}} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <BasicProfileIcon width={35} height={35} />
          </View>
        )}
        {/* <Image source={{uri: avatar}} style={styles.avatar} /> */}
        <View style={styles.right}>
          <View style={styles.namePill}>
            <Text style={styles.nameText}>{name}</Text>
          </View>
          <View style={styles.bubbleWrap}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText} numberOfLines={2}>
                {text}
              </Text>
            </View>
            <View style={styles.tail} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ▼▼▼ [수정] container를 화면 전체 너비를 차지하는 중앙 정렬 컨테이너로 변경 ▼▼▼
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center', // 자식 요소를 가로 중앙에 배치
    zIndex: 15,
  },
  // ▼▼▼ [추가] 실제 콘텐츠(아바타+말풍선)를 감싸는 래퍼 추가 ▼▼▼
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // 이 View의 자식인 'right'(말풍선 부분)을 기준으로 중앙 정렬됩니다.
    // 아바타는 말풍선 왼쪽에 위치하므로, 전체적으로 말풍선이 중앙에 가깝게 보입니다.
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 50,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  right: {
    marginLeft: 9,
  },
  namePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF7EF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  nameText: {
    fontSize: 12,
    color: '#008F47',
    fontWeight: '500',
  },
  bubbleWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  bubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 12,
    color: '#767676',
    fontWeight: '400',
  },
  tail: {
    position: 'absolute',
    left: -6,
    top: 9,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#fff',
  },
});
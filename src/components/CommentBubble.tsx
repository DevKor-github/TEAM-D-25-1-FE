// src/components/CommentBubble.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';

type Props = {
  name: string;
  text: string;
  style?: ViewStyle; 
  // ▼▼▼ 1. avatar 대신 profileImage URL을 직접 받도록 props를 수정합니다. (string | null | undefined) ▼▼▼
  profileImage?: string | null; 
};

// 기본 이미지 경로는 그대로 유지합니다.
const defaultAvatar = require('../assets/basic_profile.svg');

export default function CommentBubble({ name, text, style, profileImage }: Props) {
  // ▼▼▼ 2. profileImage URL의 유무에 따라 이미지 소스를 결정합니다. ▼▼▼
  const imageSource = profileImage
    ? { uri: profileImage } // URL이 있으면 네트워크 이미지를 사용
    : defaultAvatar;        // URL이 없으면(null, undefined) 기본 이미지를 사용

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <View style={styles.contentWrapper}>
        {/* ▼▼▼ 3. 위에서 결정된 imageSource를 적용합니다. ▼▼▼ */}
        <Image source={imageSource} style={styles.avatar} />
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
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 50,
    backgroundColor: '#ddd', // 이미지가 로드되기 전 배경색
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
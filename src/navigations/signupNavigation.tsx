// src/navigations/signupNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

type Props = {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  disabledNext?: boolean;
};

export default function SignupNavigation({
  onBack,
  onNext,
  backLabel = '이전',
  nextLabel = '다음',
  disabledNext = false,
}: Props) {
  return (
    <SafeAreaView style={styles.footer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>{backLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.nextButton, disabledNext && styles.nextButtonDisabled]}
        onPress={onNext}
        disabled={disabledNext}
      >
        <Text style={styles.nextButtonText}>{nextLabel}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  backButton: {
    // flex: 1 제거
    width: 100,             
    height: 48,
    borderRadius: 24,       
    backgroundColor: '#F6F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F6F6F8',
    marginRight: 8,
    marginLeft: 20,
    marginBottom: 25,
  },
  backButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,                 //이전버튼을 고정너비설정 후 나머지..일케함
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6CDF44',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
    marginRight:20,
  },
  nextButtonDisabled: {
    backgroundColor: '#C1F8AE',
  },
  nextButtonText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '500',
  },
});

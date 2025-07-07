// src/components/FooterNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

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
  backLabel = '← 이전으로',
  nextLabel = '다음',
  disabledNext = false,
}: Props) {
  return (
    <SafeAreaView style={styles.footer}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
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
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#999',
    fontWeight: 500,
    marginLeft: 25,
  },
  nextButton: {
    backgroundColor: '#6CDF44',
    borderRadius: 999,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 25,
    marginRight: 25,
    marginBottom: 20,
  },
  nextButtonDisabled: {
    backgroundColor: '#C1F8AE',
  },
  nextButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '500',
  },
});

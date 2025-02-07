import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Banner = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>Nick8</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    height: 75,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: 36,
    color: '#00e5ff',
    textShadowColor: '#000',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 1,
  },
});

export default Banner;
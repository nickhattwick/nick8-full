import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Image, ImageBackground } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Map badge names to their corresponding image files
const badgeImages = {
  "Solar Spark": require('../assets/badges/Solar Spark.png'),
  "Lunar Cycle": require('../assets/badges/Lunar Cycle.png'),
  "Aurora Glow": require('../assets/badges/Aurora Glow.png'),
  "Sustained Radiance": require('../assets/badges/Sustained Radiance.png'),
  "Eternal Light": require('../assets/badges/Eternal Light.png'),
  "First Bite": require('../assets/badges/First Bite.png'),
  "Tasty Ten": require('../assets/badges/Tasty Ten.png'),
  "Fresh Twenty-Five": require('../assets/badges/Fresh Twenty-Five.png'),
  "Harvest Feast": require('../assets/badges/Harvest Feast.png'),
  "Bounty of 100": require('../assets/badges/Bounty of 100.png'),
};

const BadgesScreen = () => {
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const response = await fetch('https://nick-8.com/api/user/badges', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setBadges(data.badges || []);
        } else {
          console.error('Failed to fetch badges:', data.error);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5bcc6c" />
        <Text style={styles.loadingText}>Loading Badges...</Text>
      </View>
    );
  }

  if (badges.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Your Badges</Text>
        <Text style={styles.noBadgesText}>You haven’t earned any badges yet. Keep logging meals!</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/badgescreen.png')}
      style={styles.background}
    >
      <View style={styles.mainContainer}>
        <Text style={styles.header}>Your Badges</Text>
        <View style={styles.badgeListContainer}>
          <FlatList
            data={badges}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <View style={styles.badgeContainer}>
                {badgeImages[item] ? (
                  <Image source={badgeImages[item]} style={styles.badgeImage} />
                ) : (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>Image Missing</Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent to show the background image
  },
  container: {
    flex: 1,
    paddingLeft: 90,
    paddingRight: 90,
    paddingTop: 190,
    paddingBottom: 190,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for better visibility
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#2e7d32',
  },
  noBadgesText: {
    fontSize: 16,
    color: '#616161',
    textAlign: 'center',
    marginTop: 20,
  },
  badgeListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 90,
    paddingRight: 90,
    paddingTop: 190,
    paddingBottom: 190,
  },
  row: {
    justifyContent: 'space-between',
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    width: 90,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 45,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#c8e6c9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 45,
  },
  placeholderText: {
    fontSize: 12,
    color: '#888',
  },
});

export default BadgesScreen;

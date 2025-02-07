// TextEntryScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TextEntryScreen = () => {
  const [text, setText] = useState('');
  const navigation = useNavigation();

  const handleSubmit = () => {
    // Handle submission to OpenAI or your server
    navigation.navigate('NutritionScreen', { data: text });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter or transcribe food details"
        value={text}
        onChangeText={setText}
        multiline
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 200,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
  },
});

export default TextEntryScreen;

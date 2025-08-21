import React, {useState} from 'react';
import {StyleSheet, View, ScrollView, TouchableOpacity} from 'react-native';
import {Button, Text, TextInput, Card, Title, Paragraph} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen = ({navigation}: Props) => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!content.trim()) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      navigation.navigate('Analysis', {analysisId: '123'});
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Check for Misinformation</Title>
          <Paragraph style={styles.subtitle}>
            Enter text or paste a URL to analyze for potential misinformation
          </Paragraph>
          
          <TextInput
            mode="outlined"
            label="Enter text or URL"
            multiline
            numberOfLines={6}
            value={content}
            onChangeText={setContent}
            style={styles.input}
          />
          
          <Button
            mode="contained"
            onPress={handleAnalyze}
            loading={isAnalyzing}
            disabled={!content.trim()}
            style={styles.button}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
          </Button>
          
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>
          
          <Button
            mode="outlined"
            icon="camera"
            onPress={() => {}}
            style={styles.secondaryButton}>
            Scan Document
          </Button>
          
          <Button
            mode="outlined"
            icon="link"
            onPress={() => {}}
            style={styles.secondaryButton}>
            Check URL
          </Button>
        </Card.Content>
      </Card>
      
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Analyses</Text>
        <Text style={styles.emptyText}>No recent analyses</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#7f8c8d',
    fontSize: 14,
  },
  secondaryButton: {
    marginBottom: 10,
    borderColor: '#3498db',
  },
  recentSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 20,
  },
});

export default HomeScreen;

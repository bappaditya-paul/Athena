import React from 'react';
import {View, StyleSheet, ScrollView, Share} from 'react-native';
import {Button, Text, Card, Title, ProgressBar, Chip} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type AnalysisResult = {
  id: string;
  content: string;
  isMisinformation: boolean;
  confidence: number;
  explanation: string;
  sources: Array<{title: string; url: string}>;
  timestamp: string;
};

const MOCK_ANALYSIS: AnalysisResult = {
  id: '123',
  content: 'Sample content that was analyzed for misinformation...',
  isMisinformation: true,
  confidence: 0.87,
  explanation: 'This content shows indicators of potential misinformation.',
  sources: [
    {title: 'FactCheck.org', url: 'https://www.factcheck.org'},
    {title: 'Snopes', url: 'https://www.snopes.com'},
  ],
  timestamp: new Date().toISOString(),
};

type Props = NativeStackScreenProps<RootStackParamList, 'Analysis'>;

const AnalysisScreen = ({route}: Props) => {
  const analysis = MOCK_ANALYSIS;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Analysis: ${analysis.content.substring(0, 100)}...`,
        title: 'Misinformation Analysis',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title>Analysis Result</Title>
            <Chip
              mode="outlined"
              style={[
                styles.statusChip,
                analysis.isMisinformation ? styles.statusDanger : styles.statusSuccess,
              ]}>
              {analysis.isMisinformation ? 'Potential Misinformation' : 'Likely Accurate'}
            </Chip>
          </View>

          <View style={styles.confidenceContainer}>
            <Text>Confidence: {(analysis.confidence * 100).toFixed(0)}%</Text>
            <ProgressBar
              progress={analysis.confidence}
              color={analysis.isMisinformation ? '#e74c3c' : '#2ecc71'}
              style={styles.progressBar}
            />
          </View>

          <Text style={styles.sectionTitle}>Analysis</Text>
          <Text>{analysis.explanation}</Text>

          <Text style={styles.sectionTitle}>Sources</Text>
          {analysis.sources.map((source, index) => (
            <Button key={index} mode="outlined" icon="open-in-new" style={styles.sourceButton}>
              {source.title}
            </Button>
          ))}

          <View style={styles.buttonRow}>
            <Button mode="contained" onPress={handleShare} style={styles.actionButton}>
              Share
            </Button>
            <Button mode="outlined" style={styles.actionButton}>
              New Analysis
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5', padding: 16},
  card: {marginBottom: 20, borderRadius: 12, elevation: 2},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  statusChip: {marginLeft: 10, borderWidth: 0},
  statusDanger: {backgroundColor: '#ffebee'},
  statusSuccess: {backgroundColor: '#e8f5e9'},
  confidenceContainer: {marginBottom: 20},
  progressBar: {height: 8, borderRadius: 4, backgroundColor: '#ecf0f1', marginTop: 4},
  sectionTitle: {fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8, color: '#2c3e50'},
  sourceButton: {marginBottom: 8},
  buttonRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 24},
  actionButton: {flex: 1, marginHorizontal: 4},
});

export default AnalysisScreen;

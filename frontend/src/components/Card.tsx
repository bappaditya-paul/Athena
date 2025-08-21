import React from 'react';
import {StyleSheet, StyleProp, ViewStyle, View, TouchableOpacity} from 'react-native';
import {Card as PaperCard, Title, Paragraph, useTheme} from 'react-native-paper';
import {Theme} from '../theme';

type CardProps = {
  title?: string;
  subtitle?: string;
  content: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<ViewStyle>;
  subtitleStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  coverImage?: string;
  elevation?: number;
  borderRadius?: number;
  padding?: number;
};

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  content,
  onPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  children,
  coverImage,
  elevation = 2,
  borderRadius = 8,
  padding = 16,
}) => {
  const theme = useTheme<Theme>();
  
  const renderContent = () => (
    <View style={[styles.content, contentStyle, {padding}]}>
      {subtitle && (
        <Paragraph style={[styles.subtitle, subtitleStyle]}>
          {subtitle}
        </Paragraph>
      )}
      {title && (
        <Title style={[styles.title, titleStyle]}>
          {title}
        </Title>
      )}
      <Paragraph style={styles.paragraph}>{content}</Paragraph>
      {children}
    </View>
  );

  const cardStyle = [
    styles.card,
    {elevation, borderRadius, backgroundColor: theme.colors.surface},
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onPress}
        style={cardStyle}
      >
        {coverImage && (
          <PaperCard.Cover source={{uri: coverImage}} style={styles.cover} />
        )}
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {coverImage && (
        <PaperCard.Cover source={{uri: coverImage}} style={styles.cover} />
      )}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  cover: {
    height: 160,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Card;

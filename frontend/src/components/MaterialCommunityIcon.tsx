import React from 'react';
declare module 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type IconProps = {
  name: string;
  color: string;
  size: number;
  direction?: 'rtl' | 'ltr' | 'auto';
};

const MaterialCommunityIcon = ({ name, color, size, direction = 'auto' }: IconProps) => {
  return <MaterialCommunityIcons name={name} color={color} size={size} />
};

export default MaterialCommunityIcon;
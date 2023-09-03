import {Img, ImgProps} from '@react-email/components';
import React from 'react';

export const TeamLogo: React.FC<{abbrev: string} & ImgProps> = ({abbrev, ...rest}) => {
  const src = `https://a.espncdn.com/i/teamlogos/nfl/500/${abbrev}.png`;
  return <Img src={src} {...rest} />;
};

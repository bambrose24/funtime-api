import * as React from 'react';
import {Link, LinkProps} from '@react-email/components';
import {colors} from '../theme';

const buttonVariants = ['primary'] as const;
type ButtonVariant = typeof buttonVariants[number];

type ButtonProps = LinkProps & {variant?: ButtonVariant};

export function FuntimeButton({variant = 'primary', ...props}: ButtonProps) {
  const variantStyle = getStyleForVariant(variant);
  return (
    <Link
      style={{
        borderRadius: '4px',
        paddingLeft: '12px',
        paddingRight: '12px',
        paddingTop: '8px',
        paddingBottom: '8px',
        textAlign: 'center',
        ...(variantStyle ?? {}),
        ...(props.style ?? {}),
      }}
      {...props}
    />
  );
}

function getStyleForVariant(variant: ButtonVariant): LinkProps['style'] {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary,
        color: 'white',
      };
  }
}

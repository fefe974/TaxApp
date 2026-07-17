import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const stroke = (props) => ({
  fill: 'none',
  stroke: props.color || 'currentColor',
  strokeWidth: props.strokeWidth ?? 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export function IconMenu({ size = 22, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 6h18M3 12h18M3 18h18" {...stroke({ color, strokeWidth: 1.9 })} />
    </Svg>
  );
}

export function IconChevronLeft({ size = 24, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 18l-6-6 6-6" {...stroke({ color, strokeWidth: 2 })} />
    </Svg>
  );
}

export function IconClose({ size = 22, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" {...stroke({ color, strokeWidth: 1.8 })} />
    </Svg>
  );
}

export function IconInicio({ size = 20, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 10.5 12 3l9 7.5" {...stroke({ color })} />
      <Path d="M5 9.5V21h14V9.5" {...stroke({ color })} />
      <Path d="M9.5 21v-6h5v6" {...stroke({ color })} />
    </Svg>
  );
}

export function IconLibro({ size = 20, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6.5a2.5 2.5 0 0 0 0 5H19" {...stroke({ color })} />
      <Path d="M9 7h6" {...stroke({ color })} />
    </Svg>
  );
}

export function IconReglas({ size = 20, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3v18M3 7h18M7 7l-3.5 6a3.5 3.5 0 0 0 7 0L7 7ZM17 7l-3.5 6a3.5 3.5 0 0 0 7 0L17 7Z"
        {...stroke({ color })}
      />
    </Svg>
  );
}

export function IconDiario({ size = 20, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="3" width="16" height="18" rx="2" {...stroke({ color })} />
      <Path d="M8 8h8M8 12h8M8 16h5" {...stroke({ color })} />
    </Svg>
  );
}

export function IconEstados({ size = 20, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20V10M10 20V4M16 20v-7M21 20H3" {...stroke({ color })} />
    </Svg>
  );
}

export function IconChevronDown({ size = 18, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 9l6 6 6-6" {...stroke({ color, strokeWidth: 2 })} />
    </Svg>
  );
}

export function IconCheck({ size = 15, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 13l5 5L20 7" {...stroke({ color, strokeWidth: 2.4 })} />
    </Svg>
  );
}

export function IconX({ size = 15, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" {...stroke({ color, strokeWidth: 2.4 })} />
    </Svg>
  );
}

export function IconArrowRight({ size = 16, color = '#0B7A55' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 6l6 6-6 6" {...stroke({ color, strokeWidth: 2 })} />
    </Svg>
  );
}

export function IconFlujoAbajo({ size = 13, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4v14M6 12l6 6 6-6" {...stroke({ color, strokeWidth: 2.4 })} />
    </Svg>
  );
}

export function IconCostoEfectividad({ size = 18, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2 2.7 5 3.3 5 1.4 5 3.4-2.2 3.3-5 3.3-5-1.3-5-3.2"
        {...stroke({ color, strokeWidth: 1.8 })}
      />
    </Svg>
  );
}

export function IconUtilidad({ size = 18, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3.2" {...stroke({ color, strokeWidth: 1.8 })} />
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...stroke({ color, strokeWidth: 1.8 })} />
    </Svg>
  );
}

export function IconFlexibilidad({ size = 18, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 17c4-1 5-9 12-9M16 4l4 4-4 4" {...stroke({ color, strokeWidth: 1.8 })} />
    </Svg>
  );
}

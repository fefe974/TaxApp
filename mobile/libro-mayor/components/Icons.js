import React from 'react';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const stroke = (props) => ({
  fill: 'none',
  stroke: props.color || 'currentColor',
  strokeWidth: props.strokeWidth ?? 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export function IconLibro({ size = 21, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 19.5V5a2 2 0 0 1 2-2h13v16H6.5a2.5 2.5 0 0 0 0 5H19" {...stroke({ color })} />
      <Path d="M9 7h6" {...stroke({ color })} />
    </Svg>
  );
}

export function IconReglas({ size = 21, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3v18M3 7h18M7 7l-3.5 6a3.5 3.5 0 0 0 7 0L7 7ZM17 7l-3.5 6a3.5 3.5 0 0 0 7 0L17 7Z"
        {...stroke({ color })}
      />
    </Svg>
  );
}

export function IconDiario({ size = 21, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="3" width="16" height="18" rx="2" {...stroke({ color })} />
      <Path d="M8 8h8M8 12h8M8 16h5" {...stroke({ color })} />
    </Svg>
  );
}

export function IconEstados({ size = 21, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20V10M10 20V4M16 20v-7M21 20H3" {...stroke({ color })} />
    </Svg>
  );
}

export function IconCostoEfectividad({ size = 19, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2 2.7 5 3.3 5 1.4 5 3.4-2.2 3.3-5 3.3-5-1.3-5-3.2"
        {...stroke({ color, strokeWidth: 1.8 })}
      />
    </Svg>
  );
}

export function IconUtilidad({ size = 19, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3.2" {...stroke({ color, strokeWidth: 1.8 })} />
      <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...stroke({ color, strokeWidth: 1.8 })} />
    </Svg>
  );
}

export function IconFlexibilidad({ size = 19, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 17c4-1 5-9 12-9M16 4l4 4-4 4" {...stroke({ color, strokeWidth: 1.8 })} />
      <Path d="M4 7c2 .3 3.4 1.5 4.6 3" {...stroke({ color, strokeWidth: 1.8 })} />
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

export function CornerBracket({ mirrored = false, size = 20 }) {
  const gradId = mirrored ? 'herrajeGradD' : 'herrajeGradI';
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      style={mirrored ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="0" x2="20" y2="20">
          <Stop offset="0" stopColor="#F0DBA1" />
          <Stop offset="1" stopColor="#A57A22" />
        </LinearGradient>
      </Defs>
      <Path
        d="M1.5 18V3.5C1.5 2.4 2.4 1.5 3.5 1.5H18"
        stroke={`url(#${gradId})`}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="2.4" cy="2.4" r="1.6" fill={`url(#${gradId})`} />
    </Svg>
  );
}

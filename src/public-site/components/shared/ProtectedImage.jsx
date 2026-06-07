/**
 * ProtectedImage — public site version (no Tailwind)
 * Blocks right-click "Save image as" and drag-to-desktop on event photos.
 */
import React from 'react';

const ProtectedImage = React.memo(function ProtectedImage({
  src, alt = '', className = '', style = {}, onClick,
}) {
  const block = (e) => e.preventDefault();

  return (
    <div
      className={className}
      style={{ position: 'relative', overflow: 'hidden', userSelect: 'none', ...style }}
      onContextMenu={block}
    >
      {/* Actual image — pointer-events off so overlay intercepts */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onDragStart={block}
        onContextMenu={block}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {/* Transparent overlay — intercepts right-click & drag */}
      <div
        onContextMenu={block}
        onDragStart={block}
        onClick={onClick}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          cursor: onClick ? 'pointer' : 'default',
          backgroundColor: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {/* Subtle copyright label */}
      <span style={{
        position: 'absolute',
        bottom: 6,
        right: 8,
        zIndex: 3,
        fontSize: 10,
        color: 'rgba(255,255,255,0.65)',
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        fontWeight: 500,
        letterSpacing: '0.03em',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        © Sewing Circle
      </span>
    </div>
  );
});

export default ProtectedImage;

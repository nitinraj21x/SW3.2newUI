/**
 * ProtectedImage
 * Renders an image with a transparent overlay div that:
 *  - Blocks right-click → "Save image as"
 *  - Blocks drag-to-desktop
 *  - Shows a subtle "© Sewing Circle" watermark text on hover
 *
 * Note: this is a UX deterrent, not cryptographic protection.
 * Determined users can still view source. For stronger protection,
 * serve images through a signed URL endpoint that expires.
 */
export function ProtectedImage({ src, alt = '', className = '', style = {}, onClick }) {
  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart   = (e) => e.preventDefault();

  return (
    <div
      className={`relative select-none overflow-hidden ${className}`}
      style={style}
      onContextMenu={handleContextMenu}
    >
      {/* The actual image */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onDragStart={handleDragStart}
        onContextMenu={handleContextMenu}
        className="w-full h-full object-cover pointer-events-none"
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      />

      {/* Transparent overlay — intercepts right-click and drag */}
      <div
        className="absolute inset-0 z-10"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onClick={onClick}
        style={{
          cursor: onClick ? 'pointer' : 'default',
          // Invisible but present — blocks browser's native image menu
          backgroundColor: 'transparent',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      />

      {/* Subtle copyright watermark — bottom right, visible on hover */}
      <div
        className="absolute bottom-1.5 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.7)',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          fontWeight: 500,
          letterSpacing: '0.03em',
        }}
      >
        © Sewing Circle
      </div>
    </div>
  );
}

import { useRef, useEffect } from 'react';
import { VideoProjection as Projection } from '../lib/projection';
import { generateMaskConfigs } from '../lib/masks';

export default function VideoProjection({ onReady }) {
  const canvasRef = useRef(null);
  const projRef = useRef(null);

  useEffect(() => {
    const configs = generateMaskConfigs();
    projRef.current = new Projection(canvasRef.current, configs);
    onReady?.(projRef.current);

    return () => {
      projRef.current?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}

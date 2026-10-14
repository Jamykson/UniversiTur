import { useState } from 'react';
import { Leaf } from 'lucide-react';

export default function Photo({ src, alt }) {
  const [failedSource, setFailedSource] = useState(null);
  return failedSource === src ? (
    <div className="photo-unavailable">
      <Leaf size={26} />
      <span>Foto indisponível no momento</span>
    </div>
  ) : (
    <img src={src} alt={alt} onError={() => setFailedSource(src)} />
  );
}

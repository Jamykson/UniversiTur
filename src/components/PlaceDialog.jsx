import { useEffect, useRef } from 'react';
import {
  X,
  Check,
  Leaf,
  Navigation,
  ArrowUpRight,
  ArrowRight,
  Trophy,
  BookOpen,
} from 'lucide-react';
import Photo from './Photo.jsx';

export default function PlaceDialog({ detail, visited, next, onClose, onContinue, onComplete }) {
  const dialog = useRef(null);
  useEffect(() => {
    if (detail && !dialog.current.open) dialog.current.showModal();
    else if (!detail && dialog.current.open) dialog.current.close();
  }, [detail]);
  return (
    <dialog
      ref={dialog}
      className="place-dialog"
      aria-labelledby="place-title"
      onCancel={() => onClose()}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      {detail && (
        <>
          <div className="dialog-photo">
            <Photo src={detail.image} alt={detail.caption || detail.name} />
            <button
              className="close-dialog"
              autoFocus
              aria-label="Fechar informações"
              onClick={() => onClose()}
            >
              <X size={22} />
            </button>
            {visited.includes(detail.id) && (
              <span className="arrival-badge">
                <Check size={15} />
                Lugar descoberto!
              </span>
            )}
          </div>
          <div className="dialog-body">
            <div className="eyebrow">{detail.category}</div>
            <h2 id="place-title">{detail.name}</h2>
            {detail.caption && <small className="photo-credit">{detail.caption}</small>}
            <p>{detail.description}</p>
            <div className="tip">
              <Leaf size={20} />
              <p>{detail.tip}</p>
            </div>
            <p className="coordinate-note">
              Localização aproximada. Respeite os caminhos e acessos do campus.
            </p>
            <a
              className="primary"
              href={`https://www.google.com/maps/dir/?api=1&destination=${detail.coords.join(',')}&travelmode=walking`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={17} />
              Ver caminho a pé
              <ArrowUpRight size={17} />
            </a>
            {visited.includes(detail.id) && next && (
              <button className="continue-button" onClick={onContinue}>
                Próxima parada: {next.tag || next.name}
                <ArrowRight size={17} />
              </button>
            )}
            {visited.includes(detail.id) && !next && (
              <button className="continue-button" onClick={onComplete}>
                <Trophy size={18} />
                Ver minha conquista
                <ArrowRight size={17} />
              </button>
            )}
            <a
              className="source-link"
              href="https://campusvirtual.ufrn.br/"
              target="_blank"
              rel="noreferrer"
            >
              <BookOpen size={14} />
              Campus Virtual UFRN
            </a>
          </div>
        </>
      )}
    </dialog>
  );
}

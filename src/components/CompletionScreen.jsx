import { useEffect, useRef } from 'react';
import {
  Compass,
  Trophy,
  Sparkles,
  MapPin,
  Footprints,
  Check,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Leaf,
} from 'lucide-react';
import { stops } from '../data.js';
import { OWL_IMAGE } from '../assets.js';

export default function CompletionScreen({ onRevisit, reset }) {
  const panel = useRef(null);
  useEffect(() => {
    panel.current?.focus();
  }, []);
  return (
    <section
      ref={panel}
      tabIndex={-1}
      className="completion-screen"
      aria-labelledby="completion-title"
    >
      <div className="completion-scroll">
        <div className="completion-top">
          <span>
            <Compass size={20} />
            Universitur<span className="completion-brand-dot">.</span>
          </span>
          <span>UFRN · NATAL</span>
        </div>
        <div className="completion-art">
          <div className="owl-orbit orbit-one" />
          <div className="owl-orbit orbit-two" />
          <span className="completion-star star-one">✦</span>
          <span className="completion-star star-two">✧</span>
          <span className="completion-star star-three">✦</span>
          <span className="completion-star star-four">✧</span>
          <img
            className="completion-owl"
            src={OWL_IMAGE}
            alt="Coruja branca de olhos dourados comemorando com a asa levantada"
          />
          <div className="completion-medal">
            <Trophy size={18} />
            <span>EXPLORADOR DO CAMPUS</span>
          </div>
        </div>
        <div className="completion-copy">
          <div className="completion-eyebrow">
            <Sparkles size={14} /> TRILHA CONCLUÍDA
          </div>
          <h2 id="completion-title">
            Você foi além.
            <br />
            <em>O campus é seu!</em>
          </h2>
          <p>
            Entre passos e descobertas, você conheceu
            <br />
            cinco lugares e levou novas histórias.
          </p>
        </div>
        <div className="completion-stats">
          <div>
            <MapPin size={19} />
            <strong>5 de 5</strong>
            <span>lugares descobertos</span>
          </div>
          <div>
            <Footprints size={19} />
            <strong>Uma trilha</strong>
            <span>muitas histórias</span>
          </div>
        </div>
        <div className="completion-passport" aria-label="Todas as cinco paradas concluídas">
          {stops.map((stop, i) => (
            <span key={stop.id}>
              <Check size={12} />
              {String(i + 1).padStart(2, '0')} ·{' '}
              {stop.tag ||
                (stop.id === 'biblioteca'
                  ? 'Biblioteca'
                  : stop.id === 'convivencia'
                    ? 'Convivência'
                    : stop.name)}
            </span>
          ))}
        </div>
        <div className="completion-actions">
          <button className="completion-primary" onClick={onRevisit}>
            <BookOpen size={18} />
            Revisitar minhas descobertas
            <ArrowRight size={18} />
          </button>
          <button className="completion-secondary" onClick={reset}>
            <RotateCcw size={16} />
            Começar uma nova trilha
          </button>
        </div>
        <p className="completion-signoff">
          Leve as histórias. Deixe boas pegadas. <Leaf size={12} />
        </p>
      </div>
    </section>
  );
}

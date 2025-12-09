import React, { useRef, useState } from "react";

interface AudioDescriptionPlayerProps {
  src?: string | null;
}

/**
 * Player simples para audiodescrição.
 * - Se não tiver URL, mostra botão desabilitado (para modo demo).
 * - Quando em produção, basta garantir que `src` aponte para o arquivo de áudio da obra.
 */
export const AudioDescriptionPlayer: React.FC<AudioDescriptionPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!src) {
    return (
      <div>
        <p className="card-subtitle">
          Audiodescrição indisponível para esta obra no momento. Em produção, basta cadastrar o arquivo
          de áudio no backend e enviar a URL para o front.
        </p>
        <button className="btn btn-secondary" type="button" disabled>
          Audiodescrição indisponível
        </button>
      </div>
    );
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div>
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      <button className="btn btn-secondary" type="button" onClick={togglePlay}>
        {isPlaying ? "Pausar audiodescrição" : "Reproduzir audiodescrição"}
      </button>
    </div>
  );
};

import React from "react";

interface LibrasPlayerProps {
  src?: string | null;
}

/**
 * Player simples de vídeo em Libras.
 * - Se não tiver URL, apenas comunica que o recurso ainda não foi configurado.
 * - Em produção, `src` deve ser uma URL de vídeo (MP4, streaming, etc.).
 */
export const LibrasPlayer: React.FC<LibrasPlayerProps> = ({ src }) => {
  if (!src) {
    return (
      <div>
        <p className="card-subtitle">
          Vídeo em Libras ainda não cadastrado para esta obra. Quando o conteúdo estiver pronto, basta
          informar a URL do vídeo no backend.
        </p>
        <button className="btn btn-secondary" type="button" disabled>
          Vídeo em Libras indisponível
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          width: "100%",
          borderRadius: "0.9rem",
          overflow: "hidden",
          backgroundColor: "rgba(15,23,42,0.04)"
        }}
      >
        <video
          src={src}
          controls
          style={{ width: "100%", display: "block" }}
        />
      </div>
      <p className="card-subtitle" style={{ marginTop: "0.6rem" }}>
        Intérprete de Libras explicando a obra em detalhes para pessoas surdas.
      </p>
    </div>
  );
};

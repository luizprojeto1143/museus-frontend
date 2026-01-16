import React from "react";

interface NavigateButtonProps {
    latitude: number;
    longitude: number;
    name: string;
    onClick: () => void;
}

export const NavigateButton: React.FC<NavigateButtonProps> = ({
    onClick
}) => {
    return (
        <button
            onClick={onClick}
            className="btn btn-secondary"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem"
            }}
        >
            🧭 Como Chegar
        </button>
    );
};

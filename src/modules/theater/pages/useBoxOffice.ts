import { useState } from "react";

export type BoxOfficeStep = "LIST" | "SEATS" | "EXTRAS" | "PAY" | "DONE";

export interface ExtraItem {
    id: number;
    name: string;
    price: number;
    icon: string;
}

export interface SessionItem {
    id: number;
    title: string;
    time: string;
    price: number;
    occupancy: number;
}

const mockExtras: ExtraItem[] = [
    { id: 101, name: "Combo Pipoca G + Refri", price: 45, icon: "🍿" },
    { id: 102, name: "Camiseta Oficial", price: 80, icon: "👕" },
    { id: 103, name: "Programa de Luxo (Físico)", price: 25, icon: "📖" },
];

const mockSessions: SessionItem[] = [
    { id: 1, title: "O Fantasma da Ópera", time: "20:00", price: 120, occupancy: 85 },
    { id: 2, title: "O Fantasma da Ópera", time: "22:30", price: 100, occupancy: 40 },
    { id: 3, title: "Les Misérables", time: "19:00", price: 150, occupancy: 95 },
];

export function useBoxOffice() {
    const [step, setStep] = useState<BoxOfficeStep>("LIST");
    const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
    const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
    const [online, setOnline] = useState(true);

    const toggleExtra = (item: ExtraItem) => {
        if (selectedExtras.find(e => e.id === item.id)) {
            setSelectedExtras(selectedExtras.filter(e => e.id !== item.id));
        } else {
            setSelectedExtras([...selectedExtras, item]);
        }
    };

    const toggleSeat = (id: number) => {
        if (selectedSeats.includes(id)) {
            setSelectedSeats(selectedSeats.filter(s => s !== id));
        } else {
            setSelectedSeats([...selectedSeats, id]);
        }
    };

    const resetSale = () => {
        setStep("LIST");
        setSelectedSeats([]);
        setSelectedExtras([]);
    };

    const seatsTotal = selectedSeats.length * 120; // Hardcoded seat price for now
    const extrasTotal = selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
    const grandTotal = seatsTotal + extrasTotal;

    return {
        step, setStep,
        selectedSeats, toggleSeat,
        selectedExtras, toggleExtra,
        online, setOnline,
        sessions: mockSessions,
        extras: mockExtras,
        seatsTotal, extrasTotal, grandTotal,
        resetSale
    };
}

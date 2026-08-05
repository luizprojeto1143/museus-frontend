import { useEffect, useMemo, useState } from "react";
import { theaterApi } from "../../../api/theater";

export type BoxOfficeStep = "LIST" | "SEATS" | "EXTRAS" | "PAY" | "DONE";

export interface ExtraItem {
    id: number | string;
    name: string;
    price: number;
    icon?: string;
}

export interface SessionItem {
    id: number | string;
    title: string;
    time: string;
    price: number;
    occupancy?: number;
    extras?: ExtraItem[];
}

export interface SeatItem {
    id: number | string;
    label?: string;
    number?: number | string;
    status?: string;
    available?: boolean;
    price?: number;
}

const normalizeArray = <T,>(data: unknown): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (Array.isArray((data as { data?: unknown[] })?.data)) return (data as { data: T[] }).data;
    return [];
};

export function useBoxOffice() {
    const [step, setStep] = useState<BoxOfficeStep>("LIST");
    const [selectedSession, setSelectedSession] = useState<SessionItem | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [selectedExtras, setSelectedExtras] = useState<ExtraItem[]>([]);
    const [online, setOnline] = useState(true);
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [seats, setSeats] = useState<SeatItem[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [loadingSeats, setLoadingSeats] = useState(false);
    const [selling, setSelling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoadingSessions(true);
        theaterApi.getSessions()
            .then(res => {
                setSessions(normalizeArray<SessionItem>(res.data));
                setOnline(true);
            })
            .catch(() => {
                setError("Nao foi possivel carregar as sessoes.");
                setOnline(false);
            })
            .finally(() => setLoadingSessions(false));
    }, []);

    const selectSession = async (session: SessionItem) => {
        setSelectedSession(session);
        setSelectedSeats([]);
        setSelectedExtras([]);
        setStep("SEATS");
        setLoadingSeats(true);
        try {
            const res = await theaterApi.getSessionSeats(String(session.id));
            setSeats(normalizeArray<SeatItem>(res.data));
            setOnline(true);
        } catch {
            setSeats([]);
            setError("Nao foi possivel carregar o mapa de assentos.");
            setOnline(false);
        } finally {
            setLoadingSeats(false);
        }
    };

    const extras = useMemo(() => selectedSession?.extras || [], [selectedSession]);

    const toggleExtra = (item: ExtraItem) => {
        if (selectedExtras.find(e => String(e.id) === String(item.id))) {
            setSelectedExtras(selectedExtras.filter(e => String(e.id) !== String(item.id)));
        } else {
            setSelectedExtras([...selectedExtras, item]);
        }
    };

    const toggleSeat = (id: number | string) => {
        const seatId = String(id);
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
        } else {
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const sell = async (paymentMethod: string) => {
        if (!selectedSession || selectedSeats.length === 0) return;
        setSelling(true);
        try {
            await theaterApi.sellSeats(String(selectedSession.id), {
                seatIds: selectedSeats,
                paymentMethod,
            });
            setStep("DONE");
        } finally {
            setSelling(false);
        }
    };

    const resetSale = () => {
        setStep("LIST");
        setSelectedSession(null);
        setSelectedSeats([]);
        setSelectedExtras([]);
        setSeats([]);
    };

    const seatPrice = selectedSession?.price ?? 0;
    const seatsTotal = selectedSeats.reduce((total, seatId) => {
        const seat = seats.find(item => String(item.id) === seatId);
        return total + Number(seat?.price ?? seatPrice);
    }, 0);
    const extrasTotal = selectedExtras.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
    const grandTotal = seatsTotal + extrasTotal;

    return {
        step, setStep,
        selectedSession, selectSession,
        selectedSeats, toggleSeat,
        selectedExtras, toggleExtra,
        online, setOnline,
        sessions, seats, extras,
        loadingSessions, loadingSeats, selling, error,
        seatsTotal, extrasTotal, grandTotal,
        sell, resetSale
    };
}

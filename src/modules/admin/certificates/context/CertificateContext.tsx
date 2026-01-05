import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CertificateElement, CertificateTemplate } from '../types';

interface HistoryState {
    elements: CertificateElement[];
    backgroundUrl: string;
}

interface CertificateContextType {
    // State
    elements: CertificateElement[];
    selectedIds: string[];
    backgroundUrl: string;
    zoom: number;
    name: string;

    // Actions
    setName: (name: string) => void;
    setZoom: (zoom: number | ((prev: number) => number)) => void;
    setBackgroundUrl: (url: string) => void;

    // Element Actions
    addElement: (type: 'text' | 'variable' | 'qrcode', text?: string) => void;
    updateElement: (id: string, updates: Partial<CertificateElement>) => void;
    deleteSelected: () => void;
    duplicateSelected: () => void;

    // Selection
    setSelectedIds: (ids: string[]) => void;
    toggleSelection: (id: string) => void;

    // Layering
    bringToFront: () => void;
    sendToBack: () => void;

    // History
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    saveSnapshot: () => void;

    // Load
    loadTemplate: (template: CertificateTemplate) => void;
}

const CertificateContext = createContext<CertificateContextType | null>(null);

export const CertificateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State
    const [name, setName] = useState('Novo Modelo');
    const [elements, setElements] = useState<CertificateElement[]>([]);
    const [backgroundUrl, setBackgroundUrl] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [zoom, setZoom] = useState(0.8);

    // History Stacks
    const [past, setPast] = useState<HistoryState[]>([]);
    const [future, setFuture] = useState<HistoryState[]>([]);

    // Snapshot for Undo/Redo
    const saveSnapshot = useCallback(() => {
        setPast(prev => [...prev.slice(-20), { elements, backgroundUrl }]); // Keep last 20
        setFuture([]);
    }, [elements, backgroundUrl]);

    // Undo/Redo Logic
    const undo = useCallback(() => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);

        setFuture(prev => [{ elements, backgroundUrl }, ...prev]);
        setElements(previous.elements);
        setBackgroundUrl(previous.backgroundUrl);
        setPast(newPast);
    }, [past, elements, backgroundUrl]);

    const redo = useCallback(() => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev, { elements, backgroundUrl }]);
        setElements(next.elements);
        setBackgroundUrl(next.backgroundUrl);
        setFuture(newFuture);
    }, [future, elements, backgroundUrl]);

    // Actions
    const addElement = useCallback((type: 'text' | 'variable' | 'qrcode', text?: string) => {
        saveSnapshot();
        const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        const newElement: CertificateElement = {
            id: newId,
            type,
            x: 50,
            y: 50,
            width: type === 'qrcode' ? 100 : undefined,
            height: type === 'qrcode' ? 100 : undefined,
            text: text || (type === 'text' ? 'Novo Texto' : type === 'qrcode' ? 'QR Code' : '{{variavel}}'),
            fontSize: type === 'text' ? 24 : 14,
            fontFamily: 'Helvetica',
            color: '#000000',
            align: 'left',
            rotate: 0,
            opacity: 1
        };
        setElements(prev => [...prev, newElement]);
        setSelectedIds([newId]);
    }, [saveSnapshot]);

    const updateElement = useCallback((id: string, updates: Partial<CertificateElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    }, []);

    const deleteSelected = useCallback(() => {
        saveSnapshot();
        setElements(prev => prev.filter(el => !selectedIds.includes(el.id)));
        setSelectedIds([]);
    }, [selectedIds, saveSnapshot]);

    const toggleSelection = useCallback((id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }, []);

    const duplicateSelected = useCallback(() => {
        saveSnapshot();
        setElements(prev => {
            const newElements = [...prev];
            const newIds: string[] = [];

            selectedIds.forEach(id => {
                const el = prev.find(e => e.id === id);
                if (el) {
                    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    newElements.push({
                        ...el,
                        id: newId,
                        x: el.x + 20,
                        y: el.y + 20
                    });
                    newIds.push(newId);
                }
            });

            if (newIds.length > 0) setSelectedIds(newIds);
            return newElements;
        });
    }, [selectedIds, saveSnapshot]);

    const bringToFront = useCallback(() => {
        if (selectedIds.length === 0) return;
        saveSnapshot();
        setElements(prev => {
            const moving = prev.filter(el => selectedIds.includes(el.id));
            const others = prev.filter(el => !selectedIds.includes(el.id));
            return [...others, ...moving];
        });
    }, [selectedIds, saveSnapshot]);

    const sendToBack = useCallback(() => {
        if (selectedIds.length === 0) return;
        saveSnapshot();
        setElements(prev => {
            const moving = prev.filter(el => selectedIds.includes(el.id));
            const others = prev.filter(el => !selectedIds.includes(el.id));
            return [...moving, ...others];
        });
    }, [selectedIds, saveSnapshot]);

    const loadTemplate = useCallback((template: CertificateTemplate) => {
        setName(template.name);
        setElements(template.elements);
        setBackgroundUrl(template.backgroundUrl);
        setPast([]);
        setFuture([]);
    }, []);

    return (
        <CertificateContext.Provider value={{
            elements, selectedIds, backgroundUrl, zoom, name,
            setName, setZoom, setBackgroundUrl,
            addElement, updateElement, deleteSelected, duplicateSelected,
            setSelectedIds, toggleSelection,
            bringToFront, sendToBack,
            undo, redo, canUndo: past.length > 0, canRedo: future.length > 0, saveSnapshot,
            loadTemplate
        }}>
            {children}
        </CertificateContext.Provider>
    );
};

export const useCertificate = () => {
    const context = useContext(CertificateContext);
    if (!context) throw new Error("useCertificate must be used within CertificateProvider");
    return context;
};

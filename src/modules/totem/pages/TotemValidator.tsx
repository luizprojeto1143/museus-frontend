import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";
import React, { useState, useCallback, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { UserCheck, AlertTriangle, RotateCcw, Wifi, WifiOff, CloudLightning } from 'lucide-react';
import { api } from '../../../api/client';
import { useToast } from '../../../contexts/ToastContext';

type ScanResult = {
  guestName?: string;
  code: string;
  eventTitle?: string;
  ticketType?: string;
  checkedInAt?: string;
  status: string;
  message?: string;
};

// Simple helper to interact with IndexedDB for offline validation queue
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("totem_offline_db", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("validations")) {
        db.createObjectStore("validations", { keyPath: "clientValidationId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveOfflineValidation = async (ticketCode: string): Promise<string> => {
  const db = await openDB();
  const clientValidationId = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const item = {
    clientValidationId,
    ticketCode,
    validatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("validations", "readwrite");
    const store = transaction.objectStore("validations");
    const request = store.add(item);
    request.onsuccess = () => resolve(clientValidationId);
    request.onerror = () => reject(request.error);
  });
};

const getOfflineValidations = async (): Promise<any[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("validations", "readonly");
    const store = transaction.objectStore("validations");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const clearOfflineValidations = async (ids: string[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("validations", "readwrite");
    const store = transaction.objectStore("validations");
    let count = 0;
    
    if (ids.length === 0) {
      resolve();
      return;
    }

    ids.forEach(id => {
      const req = store.delete(id);
      req.onsuccess = () => {
        count++;
        if (count === ids.length) resolve();
      };
      req.onerror = () => reject(req.error);
    });
  });
};

export const TotemValidator: React.FC = () => {
  const { t } = useTranslation();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const { addToast } = useToast();

  const deviceId = localStorage.getItem("totem_device_id");
  const deviceToken = localStorage.getItem("totem_device_token");

  // Keep track of online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerOfflineSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check offline count on mount
  useEffect(() => {
    const checkCount = async () => {
      try {
        const items = await getOfflineValidations();
        setOfflineCount(items.length);
      } catch (err) {
        logger.error(err);
      }
    };
    checkCount();
  }, []);

  const triggerOfflineSync = async () => {
    const items = await getOfflineValidations();
    if (items.length === 0 || syncing || !deviceToken) return;

    setSyncing(true);
    addToast(`Sincronizando ${items.length} validações offline...`, "info");

    try {
      const res = await api.post("/totem/offline-sync", 
        { logs: items },
        { headers: { "X-Totem-Token": deviceToken } }
      );
      if (res.data.success) {
        const syncedIds = items.map(i => i.clientValidationId);
        await clearOfflineValidations(syncedIds);
        setOfflineCount(0);
        addToast("Sincronização offline concluída com sucesso!", "success");
      }
    } catch (err) {
      logger.error("Error during offline sync", err);
      addToast("Falha ao sincronizar lote offline. Tentando mais tarde.", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleCheckIn = useCallback(async (code: string) => {
    if (!code || processing) return;

    setProcessing(true);
    setError(null);
    setScanResult(null);

    const clientValidationId = `online-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 1. If offline, save to IndexedDB queue and return offline notification status
    if (!navigator.onLine || !deviceToken) {
      try {
        await saveOfflineValidation(code);
        setOfflineCount(prev => prev + 1);
        setScanResult({
          code,
          status: "OFFLINE",
          message: "Validação offline registrada. Será confirmada na sincronização."
        });
        addToast("Modo Offline: Validação salva localmente", "info");
      } catch (err) {
        setError("Erro ao armazenar validação offline.");
      } finally {
        setProcessing(false);
      }
      return;
    }

    // 2. Online path
    try {
      const res = await api.post("/totem/validations", 
        { ticketCode: code.trim(), clientValidationId },
        { headers: { "X-Totem-Token": deviceToken } }
      );

      if (res.data.success) {
        setScanResult({
          code,
          status: res.data.status,
          message: res.data.message
        });
        addToast("Acesso Liberado!", "success");
      } else {
        setError(res.data.message || "Ingresso inválido ou já utilizado.");
        addToast(res.data.message || "Erro na validação", "error");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro de conexão com o servidor.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setProcessing(false);
    }
  }, [processing, deviceToken, addToast]);

  const handleCheckInRef = React.useRef(handleCheckIn);
  useEffect(() => {
    handleCheckInRef.current = handleCheckIn;
  }, [handleCheckIn]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "kiosk-scanner",
      {
        fps: 10,
        qrbox: { width: 350, height: 350 },
        aspectRatio: 1,
        videoConstraints: { facingMode: "environment" }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.pause();
        handleCheckInRef.current(decodedText).finally(() => {
          setTimeout(() => {
            scanner.resume();
          }, 3000);
        });
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(e => logger.error("Scanner clear error", e));
    };
  }, []);

  return (
    <div className="totem-validator-wrapper max-w-lg mx-auto w-full space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="text-green-500 animate-pulse" size={18} />
          ) : (
            <WifiOff className="text-amber-500" size={18} />
          )}
          <span className="text-xs font-bold uppercase tracking-wider">
            {isOnline ? "Conectado" : "Modo Offline"}
          </span>
        </div>

        {offlineCount > 0 && (
          <button 
            disabled={syncing || !isOnline}
            onClick={triggerOfflineSync}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold"
          >
            <CloudLightning size={14} className={syncing ? "animate-spin" : ""} />
            <span>{offlineCount} Pendentes</span>
          </button>
        )}
      </div>

      {/* QR scanner holder */}
      <div className="premium-glass p-6 rounded-[32px] border-white/5 text-center space-y-6">
        <h2 className="text-2xl font-black italic text-white tracking-tight">Escaneie o Ingresso</h2>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Aproxime o QR Code da câmera</p>
        
        <div id="kiosk-scanner" className="overflow-hidden rounded-2xl border border-white/5 bg-black" />
      </div>

      {/* Feedback panel */}
      {processing && (
        <div className="premium-glass p-8 rounded-[32px] text-center border-amber-500/20 text-amber-400 font-bold italic animate-pulse">
          Validando ingresso...
        </div>
      )}

      {error && !processing && (
        <div className="premium-glass p-8 rounded-[32px] text-center border-red-500/20 text-red-400 font-bold space-y-3">
          <AlertTriangle size={48} className="mx-auto" />
          <h3 className="text-xl font-black italic">Acesso Recusado</h3>
          <p className="text-sm text-slate-400 font-normal">{error}</p>
        </div>
      )}

      {scanResult && !processing && (
        <div className={`premium-glass p-8 rounded-[32px] text-center border-green-500/20 text-green-400 space-y-3 ${scanResult.status === "OFFLINE" ? "border-amber-500/20 text-amber-400" : ""}`}>
          <UserCheck size={48} className="mx-auto" />
          <h3 className="text-xl font-black italic">
            {scanResult.status === "OFFLINE" ? "Validação Offline" : "Entrada Liberada!"}
          </h3>
          <p className="text-sm text-slate-400 font-normal">{scanResult.message}</p>
        </div>
      )}
    </div>
  );
};

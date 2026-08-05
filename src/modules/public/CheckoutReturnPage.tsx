import React from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

interface CheckoutReturnPageProps {
    status: "success" | "cancel";
    context: "provider-subscription" | "inbox-payment" | "accessibility";
}

export const CheckoutReturnPage: React.FC<CheckoutReturnPageProps> = ({ status, context }) => {
    const { id } = useParams();
    const { role } = useAuth();
    const isSuccess = status === "success";

    const target = (() => {
        if (context === "provider-subscription") return "/provider";
        if (context === "inbox-payment") {
            if (role === "provider") return `/provider/mensagens${id ? `?id=${id}` : ""}`;
            if (role === "producer") return `/producer/inbox${id ? `?id=${id}` : ""}`;
            return "/";
        }
        if (role === "provider") return "/provider/execucoes";
        if (role === "producer") return "/producer/services";
        return "/";
    })();

    const title = isSuccess ? "Pagamento confirmado" : "Checkout cancelado";
    const text = isSuccess
        ? "A plataforma recebeu o retorno do checkout. A confirmacao final fica vinculada ao webhook do gateway."
        : "Nenhuma cobranca foi concluida. Voce pode voltar e tentar novamente quando quiser.";

    return (
        <main className="min-h-screen bg-[#05050a] px-6 py-16 text-white">
            <section className="mx-auto flex max-w-xl flex-col items-center rounded-[32px] border border-white/10 bg-white/[0.03] p-10 text-center shadow-2xl">
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${isSuccess ? "bg-green-500/10 text-green-300" : "bg-amber-500/10 text-amber-300"}`}>
                    {isSuccess ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
                </div>
                <h1 className="text-3xl font-black">{title}</h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{text}</p>
                <Link to={target} className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-indigo-600 px-6 text-xs font-black uppercase tracking-widest text-white">
                    Voltar ao sistema
                </Link>
            </section>
        </main>
    );
};

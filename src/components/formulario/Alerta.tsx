import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type Tipo = "info" | "success" | "warning" | "danger";

const ICONES = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleX,
} as const;

interface Props {
  tipo?: Tipo;
  titulo?: string;
  children: ReactNode;
}

/* Mensagem no padrão rc-alert: sempre com ícone e palavra, nunca só cor. */
export function Alerta({ tipo = "info", titulo, children }: Props) {
  const Icone = ICONES[tipo];
  return (
    <div className={`rc-alert rc-alert--${tipo}`} role={tipo === "danger" ? "alert" : "status"}>
      <Icone className="rc-icon" aria-hidden="true" />
      <div>
        {titulo && <strong className="rc-alert__title">{titulo}</strong>}
        {children}
      </div>
    </div>
  );
}

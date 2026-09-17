import { CircleX } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  opcional?: boolean;
}

/* Campo de texto no padrão rc-field do kit, com ajuda e erro acessíveis. */
export function CampoTexto({ id, rotulo, ajuda, erro, opcional, ...input }: Props) {
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  return (
    <div className="rc-field">
      <label className="rc-label" htmlFor={id}>
        {rotulo} {opcional && <span className="rc-label__optional">(opcional)</span>}
      </label>
      <input
        id={id}
        className="rc-input"
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idErro, idAjuda].filter(Boolean).join(" ") || undefined}
        {...input}
      />
      {erro && (
        <p className="rc-error" id={idErro} role="alert">
          <CircleX className="rc-icon" aria-hidden="true" /> {erro}
        </p>
      )}
      {ajuda && (
        <p className="rc-hint" id={idAjuda}>
          {ajuda}
        </p>
      )}
    </div>
  );
}

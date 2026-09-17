"use client";

import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CircleX } from "lucide-react";
import { useState } from "react";
import { TEXTO_RICO_VAZIO, type TextoRico } from "@/lib/texto-rico/schema";
import { BarraEditor } from "./BarraEditor";

interface Props {
  id: string;
  name: string;
  rotulo: string;
  valorInicial?: TextoRico | null;
  ajuda?: string;
  erro?: string;
  opcional?: boolean;
}

/*
 * Editor Tiptap limitado a negrito, itálico, sublinhado, listas, cor e emojis.
 * Envia o JSON do documento em um campo oculto; o servidor valida com schemaTextoRico.
 * Carregar com next/dynamic({ ssr: false }) para não pesar o servidor.
 */
export function EditorRico({ id, name, rotulo, valorInicial, ajuda, erro, opcional }: Props) {
  const inicial = valorInicial ?? TEXTO_RICO_VAZIO;
  const [json, setJson] = useState(() => JSON.stringify(inicial));
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        link: false,
      }),
      TextStyleKit.configure({ backgroundColor: false, fontFamily: false, fontSize: false, lineHeight: false }),
    ],
    content: inicial,
    onUpdate: ({ editor: e }) => setJson(JSON.stringify(e.getJSON())),
    editorProps: { attributes: { class: "tiptap", "aria-labelledby": `${id}-rotulo`, id } },
  });

  const idErro = erro ? `${id}-erro` : undefined;
  const idAjuda = ajuda ? `${id}-ajuda` : undefined;

  return (
    <div className="rc-field">
      <span className="rc-label" id={`${id}-rotulo`}>
        {rotulo} {opcional && <span className="rc-label__optional">(opcional)</span>}
      </span>
      <div className="rc-editor">
        {editor && <BarraEditor editor={editor} />}
        <div className="rc-editor__area" aria-invalid={erro ? true : undefined} aria-describedby={idErro ?? idAjuda}>
          <EditorContent editor={editor} />
        </div>
      </div>
      <input type="hidden" name={name} value={json} />
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

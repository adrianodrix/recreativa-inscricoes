"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Redo2, Smile, Underline, Undo2 } from "lucide-react";
import { useState, type ComponentType } from "react";
import { CORES_TEXTO, EMOJIS } from "./paleta";

interface BotaoProps {
  rotulo: string;
  ativo?: boolean;
  desabilitado?: boolean;
  Icone: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  aoClicar: () => void;
}

function Botao({ rotulo, ativo, desabilitado, Icone, aoClicar }: BotaoProps) {
  return (
    <button
      type="button"
      className="rc-btn rc-editor__botao"
      aria-label={rotulo}
      title={rotulo}
      aria-pressed={ativo ?? undefined}
      disabled={desabilitado}
      onMouseDown={(e) => e.preventDefault()}
      onClick={aoClicar}
    >
      <Icone className="rc-icon" aria-hidden />
    </button>
  );
}

export function BarraEditor({ editor }: { editor: Editor }) {
  const [emojisAbertos, setEmojisAbertos] = useState(false);
  const estado = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      cor: (e.getAttributes("textStyle").color as string | undefined) ?? "",
      podeDesfazer: e.can().undo(),
      podeRefazer: e.can().redo(),
    }),
  });
  const cmd = () => editor.chain().focus();

  return (
    <div className="rc-editor__barra" role="toolbar" aria-label="Formatação">
      <Botao rotulo="Negrito" Icone={Bold} ativo={estado.bold} aoClicar={() => cmd().toggleBold().run()} />
      <Botao rotulo="Itálico" Icone={Italic} ativo={estado.italic} aoClicar={() => cmd().toggleItalic().run()} />
      <Botao rotulo="Sublinhado" Icone={Underline} ativo={estado.underline} aoClicar={() => cmd().toggleUnderline().run()} />
      <Botao rotulo="Lista" Icone={List} ativo={estado.bulletList} aoClicar={() => cmd().toggleBulletList().run()} />
      <Botao rotulo="Lista numerada" Icone={ListOrdered} ativo={estado.orderedList} aoClicar={() => cmd().toggleOrderedList().run()} />
      <div className="rc-editor__cores" role="group" aria-label="Cor do texto">
        {CORES_TEXTO.map((cor) => (
          <button
            key={cor.valor}
            type="button"
            className="rc-editor__cor"
            style={{ background: cor.valor }}
            aria-label={`Cor ${cor.nome}`}
            title={cor.nome}
            aria-pressed={estado.cor.toLowerCase() === cor.valor}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => cmd().setColor(cor.valor).run()}
          />
        ))}
        <button
          type="button"
          className="rc-btn rc-btn--sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => cmd().unsetColor().run()}
        >
          Sem cor
        </button>
      </div>
      <Botao rotulo="Emojis" Icone={Smile} ativo={emojisAbertos} aoClicar={() => setEmojisAbertos((v) => !v)} />
      <Botao rotulo="Desfazer" Icone={Undo2} desabilitado={!estado.podeDesfazer} aoClicar={() => cmd().undo().run()} />
      <Botao rotulo="Refazer" Icone={Redo2} desabilitado={!estado.podeRefazer} aoClicar={() => cmd().redo().run()} />
      {emojisAbertos && (
        <div className="rc-editor__emojis" role="group" aria-label="Inserir emoji">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rc-editor__emoji"
              aria-label={`Inserir ${emoji}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => cmd().insertContent(emoji).run()}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

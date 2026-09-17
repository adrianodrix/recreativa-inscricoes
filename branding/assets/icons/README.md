# Ícones

Biblioteca oficial: **[Lucide](https://lucide.dev)** v1.46.0 (licença ISC, em `LICENSE-lucide.txt`).
Os 33 SVGs desta pasta são a seleção de referência para o app de inscrições; qualquer outro ícone do Lucide pode ser usado.

## Regras

- Traço de 2px, pontas arredondadas, sem preenchimento: não altere `stroke-width` nem misture com outras bibliotecas.
- A cor vem do texto (`stroke="currentColor"`). Em `<img>` o ícone fica preto; no app, use SVG inline ou o pacote do framework (`lucide-react`, `lucide-vue-next`…).
- Tamanhos: `--icon-sm` (16px) com `text-sm`, `--icon-md` (20px) com `text-base`, `--icon-lg` (24px) em navegação e destaques.
- Ícone sozinho em botão precisa de `aria-label`; ícone ao lado de texto leva `aria-hidden="true"`.
- Status sempre com ícone **e** palavra: `circle-check` (sucesso), `triangle-alert` (aviso), `circle-x` (erro), `info` (informação).

## Seleção

| Uso | Ícones |
| --- | --- |
| Navegação | `menu` `x` `chevron-down` `chevron-left` `chevron-right` `arrow-left` `arrow-right` `external-link` `search` |
| Ações | `plus` `minus` `pencil` `trash-2` `download` `upload` `filter` `log-out` |
| Status | `check` `circle-check` `triangle-alert` `circle-x` `info` `loader-circle` |
| Inscrição | `calendar` `clock` `map-pin` `users` `user` `ticket` `credit-card` `mail` `phone` `file-text` |

# Plano: Webapp de inscrições da Recreativa

## Contexto

A Recreativa é um evento anual que reúne famílias, pais, jovens e crianças para confraternizar e ter conexão com a Bíblia e uns com os outros, por meio de brincadeiras e dinâmicas entre casais, pais e filhos, jovens e crianças.

O objetivo é construir um webapp para gerenciar as inscrições desse evento. O projeto começa do zero na pasta `/Users/adriano/Projects/Recreativa/app-inscricoes` (ainda não é repositório git).

## Requisitos consolidados

### Produto
- [R1] Webapp de inscrições para a Recreativa.
- [R2] Visual leve e simples.
- [R3] Deve funcionar com rapidez em celulares (uso principal pelo celular, interface pensada primeiro para telas pequenas).

### Eventos
- [R4] O sistema deve permitir cadastrar **vários eventos**, não apenas um. Como a Recreativa é anual, cada edição é um evento distinto (ex.: Recreativa 2026, Recreativa 2027). As inscrições ficam sempre vinculadas a um evento específico.

### Público
- Famílias, pais, jovens e crianças.
- Confirmado: a pessoa que se inscreve pode cadastrar cônjuge e filhos no mesmo fluxo. Cada pessoa vira um registro único de inscrição, vinculado a quem cadastrou, com o tipo de vínculo.

### Experiência do formulário de inscrição
- [R5] Experiência igual ao Tally ou outras ferramentas modernas de formulário: formulário dinâmico, **uma pergunta por vez**, com animação na transição entre etapas e nos campos.
- [R6] O fluxo é condicional: as etapas aparecem ou não conforme as respostas anteriores (idade, estado civil, etc.).

### Fluxo de inscrição (etapas)
- [E1] **Nome completo** (obrigatório). Mínimo de 10 caracteres. Validar se realmente é um nome completo (ex.: pelo menos duas palavras, sem números).
  - **Unicidade por nome completo** (dentro do evento): se já existir inscrito com o mesmo nome completo (comparação normalizada: sem acentos, sem diferença de maiúsculas, espaços extras), **bloquear a nova inscrição** e avisar que a pessoa já está inscrita. Isso cobre o caso de cônjuge/filho já cadastrado por outra pessoa.
  - A mesma validação vale ao cadastrar cônjuge e filhos (E5/E6): não criar duplicado se o nome já existir no evento.
- [E2] **Como gostaria de ser chamado / como é conhecido** (opcional).
- [E3] **Data de nascimento** (obrigatório). Sem idade mínima ou máxima. A idade é calculada a partir da data de nascimento **com referência na data do evento** (decisão do usuário: quem faz aniversário antes da Recreativa já entra na categoria certa) e **ambas (data e idade) são gravadas na tabela**. Todo o fluxo condicional (E4, E8, etc.) usa a idade calculada. O mesmo vale para cônjuge e filhos. Se o administrador alterar a data do evento depois de haver inscritos, o painel recalcula as idades gravadas.
- [E4] **Casado?** (sim/não). Só é perguntado se idade > 18.
- [E5] **Cadastrar cônjuge?** Só se casado. Opções: "sim", "não quero cadastrar", "ele(a) vai se cadastrar". Se "sim": coleta nome e data de nascimento do cônjuge. O cônjuge vira um registro único na tabela de inscritos, vinculado ao inscrito principal, com tipo de vínculo = cônjuge.
- [E6] **Tem filhos menores de 18 anos?** (sim/não). Só se casado (confirmado: solteiros não recebem esta pergunta). Se sim: **cadastrar os filhos?** Opções: "sim", "não quero cadastrar", "ele(s) vai(ão) se cadastrar". Se "sim": coleta nome e data de nascimento de cada filho, permitindo cadastrar mais de um. Cada filho vira um registro único na tabela, vinculado ao inscrito principal, com tipo de vínculo = filho(a).
  - _(o item 7 da mensagem original era idêntico ao 6; foi tratado como duplicata e as etapas seguintes foram renumeradas.)_
- [E7] **Colaboração com comida/bebida**. Só se idade > 12. Tipos permitidos: **salgado, doce, refrigerante, suco**.
  - **Uma unidade por pessoa**: a pessoa só escolhe o **tipo**; cada inscrito conta como **1 unidade** no estoque daquele tipo. Não há campo de quantidade.
  - Regra de estoque: o administrador define, por evento, a quantidade máxima de cada tipo. Quando o número de inscritos que escolheram um tipo for igual ou maior que o máximo, aquele tipo fica bloqueado e a pessoa precisa escolher outro tipo ainda disponível. Ex.: máximo 100 salgados já atingido → não pode escolher salgado, só doce, refrigerante ou suco.
  - Implica um contador por tipo e por evento, verificado no momento de gravar a inscrição (com proteção contra concorrência, pois várias pessoas podem se inscrever ao mesmo tempo).
- [E8] **Dinâmicas e brincadeiras**: etapa mais importante e que exige mais atenção.
  - As brincadeiras são cadastradas previamente pelo administrador (ver seção "Cadastro de brincadeiras").
  - Na inscrição, **uma brincadeira aparece por vez**, filtrada pela **regra de idade e tipo do participante** (idade calculada, estado civil e vínculo).
  - Só aparecem brincadeiras do evento em questão que ainda tenham vaga (ver regra de quantidade máxima).
  - Para cada brincadeira exibida o participante indica se vai participar ou não. Pode escolher várias, todas se quiser.

- [E9] **Resumo / revisão**. Antes de concluir, o formulário mostra um **resumo de tudo que foi informado** (dados pessoais, cônjuge, filhos, comida/bebida, brincadeiras), para a pessoa conferir e **voltar para alterar** o que quiser. Só depois de confirmar a inscrição é gravada.
- [E10] **Página de agradecimento**. Exibida após a confirmação. Contém, nesta ordem: (1) o **texto de agradecimento** configurado pelo administrador por evento (campo aberto para informar mais detalhes) e (2) logo abaixo, o **texto de recomendações importantes** do evento. Ambos com o mesmo editor de texto rico das regras das brincadeiras (negrito, itálico, cores, emojis).
- [E11] **Após a inscrição não é possível alterar.** O inscrito não edita nada depois de confirmar; **somente o administrador** pode alterar uma inscrição.
- [E12] **WhatsApp** (coletado ao final do processo, antes do resumo). **Regra: só é pedido, e é obrigatório, quando a inscrição tem pelo menos uma participação em brincadeira** — do próprio inscrito principal, do cônjuge ou dos filhos que ele cadastrou ("quem vai participar da brincadeira ou enviará filhos para participar"). Quem não se inscreveu em nenhuma brincadeira (ex.: solteiros acima de 30, que não têm brincadeiras) **não passa por esta etapa** e não recebe mensagens. Usado para a **confirmação da inscrição** e os **avisos de times** via **Evolution API**. Validar formato brasileiro (DDD + número).

### Dependentes no mesmo fluxo (confirmado)
- Quem cadastra cônjuge e filhos **também escolhe comida/bebida e brincadeiras por eles**, no mesmo fluxo. A recomendação do evento é que a família esteja junta, pensando e decidindo.
- Ordem sugerida do fluxo após os dados da família: comida/bebida de cada pessoa > 12 anos → brincadeiras de cada pessoa (principal, cônjuge, filhos) conforme categoria → WhatsApp → resumo → confirmação.

### Confirmação por WhatsApp
- Após confirmar a inscrição, enviar mensagem de confirmação pelo WhatsApp do inscrito principal via **Evolution API** (instância própria do organizador; URL e API key em variáveis de ambiente). Só para inscrições que informaram WhatsApp (ou seja, com participação em brincadeira).
- Conteúdo sugerido: nome do evento, data, horário, local com link do Google Maps, resumo (pessoas inscritas, comida/bebida, brincadeiras) e recomendações importantes.
- Envio assíncrono e tolerante a falha: a inscrição é gravada mesmo se o envio falhar; registrar status do envio para o admin reenviar.

### Cadastro de eventos (administrador)
Rascunho aprovado pelo usuário com os ajustes abaixo.
- [V1] **Nome do evento** (obrigatório). Ex.: "Recreativa 2026".
- [V2] **Data do evento** (obrigatório). **Data única, um dia somente.**
- [V3] **Horário de início** e **horário de fim** (obrigatórios).
- [V4] **Local** (obrigatório): **endereço** (texto) e **link do Google Maps** (URL).
- [V5] **Texto de recomendações importantes** (texto rico). Aparece **somente no final**, na página de agradecimento, **abaixo do texto de agradecimento**.
- [V6] **Período de inscrições** (obrigatório): **data de início** e **data de fim**. Fora do período o formulário não aceita inscrições.
- [V7] **Status das inscrições**: controlado **manualmente e automaticamente**. As inscrições encerram por qualquer um destes motivos:
  - automaticamente, ao **terminar o período** de inscrições;
  - automaticamente, ao atingir o **limite máximo de inscritos** do evento;
  - **manualmente**, pelo administrador (abrir/encerrar a qualquer momento).
  - Regra efetiva: inscrições abertas = status manual "aberto" **e** dentro do período **e** total de inscritos < limite.
- [V8] **Limite máximo de inscritos** do evento (obrigatório). Conta pessoas (inclui cônjuge e filhos cadastrados). Independente do limite de cada brincadeira (que é por pessoa, casal ou dupla conforme a categoria).
- [V9] **Valor da inscrição** (obrigatório, campo aberto em R$). **Zero = gratuito.** Quando maior que zero, o valor é **somente informativo** (exibido no formulário/resumo/confirmação); não há integração de pagamento.
- [V10] **Limites de comida/bebida** (obrigatório): quantidade máxima de **salgado, doce, refrigerante e suco**.
- [V11] **Texto da página de agradecimento** (obrigatório, texto rico).
- [V12] **Texto de boas-vindas / abertura do formulário** (opcional, texto rico): aparece na primeira tela antes do nome.
- [V13] **Imagem de capa** (opcional).
- [V14] **Slug / link público** do formulário de inscrição (gerado a partir do nome, editável).
- As **brincadeiras** são cadastradas dentro do evento (relação 1 evento → N brincadeiras).

### Cadastro de brincadeiras / dinâmicas (administrador)
Cada brincadeira pertence a um evento e tem os campos:
- [B1] **Nome** (obrigatório).
- [B2] **Foto** (opcional). Upload de imagem.
- [B3] **Vídeo** (opcional). **Somente URL** (YouTube, Instagram ou qualquer outra). Sem upload de vídeo.
- [B4] **Regras** (obrigatório). Campo de texto livre com formatação básica: **negrito, itálico e cores**. Deve aceitar **emojis**. Exige um editor de texto rico simples no admin e renderização segura (sanitizada) na inscrição.
- [B5] **Categoria** (uma por brincadeira): `casais`, `jovens`, `crianças`, `pais e filhos`.
  - **casais**: aceita somente inscritos **casados**. Como a vaga é do casal (2 pessoas), a brincadeira **só é oferecida quando o cônjuge foi cadastrado no mesmo fluxo** (opção "sim" em E5). Decisão do usuário.
  - **crianças**: aceita somente inscritos com **até 8 anos** (inclusive).
  - **jovens**: aceita somente **solteiros acima de 8 anos até o máximo de 30 anos** (9 a 30). Acima de 8 anos já é considerado jovem.
  - **pais e filhos**: participa-se em **dupla**: um **filho** (inscrito com vínculo filho(a)) + um **parceiro adulto**, que pode ser o **pai**, a **mãe** ou um **responsável**. Ver regras da dupla abaixo.
- [B6] **Quantidade máxima de participantes** (obrigatório). Regra: quando o limite for alcançado, a brincadeira **deixa de ser exibida** para novos inscritos. Verificar no momento de confirmar a participação, com proteção contra concorrência (mesma abordagem do estoque de comida).
  - Unidade de contagem por categoria: **crianças** e **jovens** contam **pessoas**; **casais** contam **casais** (1 casal = 1 vaga); **pais e filhos** contam **duplas** (1 dupla = 1 vaga).
- [B7] **Formato**: `individual` (um contra o outro) ou `em grupo` (times competindo contra times). Válido para **crianças, jovens e pais e filhos** (o usuário confirmou que pais e filhos também vale por time). Para **casais** o campo não se aplica.
  - Os times são **fixos por evento**, montados automaticamente e editáveis pelo administrador (ver seção "Organização de times").

### Regra de elegibilidade (resumo)
| Categoria       | Quem pode ver/participar                                              | Vaga conta |
|-----------------|-----------------------------------------------------------------------|------------|
| casais          | casado = sim (casais sem filhos só têm brincadeiras de casais)        | casal      |
| crianças        | idade ≤ 8                                                             | pessoa     |
| jovens          | casado = não e 9 ≤ idade ≤ 30                                         | pessoa     |
| pais e filhos   | dupla filho + parceiro (pai, mãe ou responsável)                      | dupla      |
| _(nenhuma)_     | solteiros acima de 30 anos: **não há brincadeiras** para eles         | —          |

### Regras da dupla em "pais e filhos"
- Cada dupla é formada por **1 filho** (inscrito com vínculo filho(a)) e **1 parceiro**.
- O parceiro pode ser: o **pai**, a **mãe** (o inscrito principal ou o cônjuge) ou um **responsável**.
- **Responsável** = um **jovem já inscrito no evento** (solteiro, 9 a 30 anos) que o pai/mãe seleciona para brincar junto com o filho. Geralmente é da família (sobrinhos, tios etc.).
  - O responsável **não precisa confirmar**; basta ser selecionado.
  - **Não exibir lista de jovens.** A seleção é por **pesquisa por nome com no mínimo 3 caracteres**; o resultado mostra **nome completo e apelido** dos jovens inscritos que ainda estejam livres naquela brincadeira.
- **Um parceiro só pode formar uma dupla por brincadeira.** Se o jovem já participa com a Maria naquela brincadeira, não pode participar também com o João. O mesmo vale para pai e mãe: cada um só pode acompanhar um filho por brincadeira.
- **Cada filho só pode estar em uma dupla por brincadeira.**
- Exemplo do usuário: o pai se inscreve com o filho menor; o filho maior também quer brincar, então seleciona a mãe; o filho do meio também quer, então seleciona um responsável (jovem já inscrito).
- Na inscrição, para cada brincadeira de pais e filhos exibida, o inscrito escolhe **qual filho** e **qual parceiro**; o sistema só oferece parceiros ainda livres naquela brincadeira.

### Escolha de brincadeiras pelo inscrito
- O inscrito pode escolher **várias brincadeiras, todas se quiser**. Não há limite por pessoa.
- Só aparecem brincadeiras da categoria compatível com o participante e que ainda tenham vaga.

### Modelo de dados (rascunho a partir do fluxo)
- **Evento**: nome, slug, data (dia único), horário de início, horário de fim, endereço, link do Google Maps, texto de recomendações importantes, período de inscrições (início/fim), status manual (aberto/encerrado), limite máximo de inscritos, valor da inscrição (0 = gratuito), limites de comida/bebida por tipo (salgado, doce, refrigerante, suco), texto de boas-vindas, texto da página de agradecimento, imagem de capa.
- **Inscrito** (um registro por pessoa): evento, nome completo, nome normalizado (para unicidade), apelido, data de nascimento, idade (calculada e gravada), casado (sim/não), tem filhos menores (sim/não), inscrito principal (referência a quem cadastrou, nulo se for o próprio), tipo de vínculo (principal, cônjuge, filho(a)), WhatsApp (só no principal, quando exigido), situação do cônjuge/filhos não cadastrados (vai se cadastrar / não quer cadastrar), data/hora da inscrição.
- **Colaboração comida/bebida**: inscrito, evento, tipo (salgado, doce, refrigerante, suco). Uma linha por inscrito (1 unidade). Único (inscrito).
- **Brincadeira**: evento, nome, foto (arquivo enviado), vídeo (URL), regras (texto rico), categoria (casais | jovens | crianças | pais e filhos), quantidade máxima (casais/duplas/pessoas conforme categoria), formato (individual | em grupo; não se aplica a casais), ativo.
- **Participação em brincadeira** (uma linha por vaga ocupada):
  - crianças/jovens: inscrito, brincadeira. Único (inscrito, brincadeira).
  - casais: inscrito principal, cônjuge, brincadeira. Único por casal e brincadeira.
  - pais e filhos: filho, parceiro (pai | mãe | responsável), tipo do parceiro, brincadeira. Únicos: (filho, brincadeira) e (parceiro, brincadeira).
  - A contagem de linhas por brincadeira alimenta a regra de limite máximo.
- **Times**: fixos por evento, ver "Modelo de dados dos times" na seção de organização de times.
- **Usuário do painel**: e-mail, nome, perfil (analítico | operador | administrador), ativo.

### Dependentes cadastrados por outra pessoa
- Cônjuge e filhos cadastrados pelo inscrito principal **já contam como inscrição**. Eles **não podem fazer uma nova inscrição**; a unicidade é garantida pela validação de nome completo (ver E1).
- Consequência (confirmada): como o dependente não passa pelo formulário depois, as etapas de **comida/bebida** e **brincadeiras** dos dependentes são resolvidas **dentro do fluxo do inscrito principal**: após cadastrar cônjuge/filhos, o formulário percorre comida (para dependentes > 12) e brincadeiras (cônjuge em casais; filhos em crianças/jovens/pais e filhos) em nome de cada dependente.

### Painel do administrador
- Acesso restrito aos **organizadores do evento**, com login. Suporta **vários administradores**.
- **Sem área pública de cadastro de usuário: somente login.** O **primeiro administrador é criado por migration**; a partir dele, os demais usuários do painel são cadastrados pelo administrador. O auto-cadastro do Supabase Auth fica desligado. Decisão do usuário.
- **Perfis de acesso**:
  - **analítico**: somente visualização (eventos, inscritos, brincadeiras, times, relatórios).
  - **operador**: somente editar/incluir inscritos nos eventos (não cadastra evento nem brincadeira, não muda status).
  - **administrador**: faz tudo (eventos, brincadeiras, status, times, usuários do painel, etc.).
- Funcionalidades confirmadas: cadastro de eventos; cadastro de brincadeiras; gestão de times (auto + edição); **lista de inscritos com busca, edição e exportação para planilha**; controle de status das inscrições; reenvio da confirmação por WhatsApp.
- **Inclusão/edição de inscritos pelo painel respeita os mesmos limites** do formulário (vagas, estoque, limite do evento). Para incluir além do limite, o administrador aumenta o limite antes. Decisão do usuário.

### Stack (preferência do usuário, aberta a recomendações)
- **TypeScript** em toda a stack.
- Hospedagem **Vercel**.
- **Supabase**: banco de dados (Postgres), auth, storage (fotos), edge functions se necessário.
- Preferência por serviços **gratuitos ou com bom plano gratuito**.
- WhatsApp via **Evolution API** (instância do organizador).
- Observação: a conexão MCP `postgres` configurada nesta sessão falhou ao conectar; se for a base do projeto, verificar depois.

### Organização de times (brincadeiras em grupo)

**Exemplo real do usuário — "Bíblia ou Bexiga"** (4 times): um participante de cada time vai ao centro, de frente para os outros. O administrador da brincadeira faz uma pergunta bíblica; quem bater primeiro na mesa responde; quem responder certo primeiro ganha; quem perde leva bexiga de água na cabeça. Quem bateu e errou, ou demorou demais, também leva a bexiga. Por isso é essencial balancear os times por **idade e quantidade**.

**Decisões confirmadas**
- [T1] **Times fixos por evento.** O mesmo time fica junto até o fim, passando por todas as brincadeiras em grupo. Não há times por brincadeira.
- [T2] **Cadastro de times por evento.** Não há campo fixo de quantidade: o administrador **cadastra cada time** (nome e imagem) dentro do evento, e a quantidade total é o número de times cadastrados (ex.: 4 times cadastrados = 4 times). Varia por evento. A montagem exige pelo menos 2 times cadastrados.
- [T3] Um time pode ter **várias idades**; o balanceamento é **por idade** e por **quantidade** (diferença máxima de 1 pessoa entre times).
- [T4] **Irmãos** (filhos do mesmo inscrito principal) vão para **times diferentes**.
- [T5] **Montagem em lote**, somente quando as **inscrições estiverem encerradas** (status efetivo encerrado, manual ou automático). O botão "Montar times" fica bloqueado enquanto abertas.
- [T6] O administrador pode **editar, remontar e gerenciar** os times, com **arrastar e soltar** entre times.
- [T7] Cada time tem **nome**, **imagem** e **quantidade de inscritos** (contagem exibida).
- [T8] **Divulgação somente por WhatsApp**, sem página pública.
- [T9] A montagem precisa ser **confirmada/aprovada** pelo administrador. Ao confirmar, disparam-se os avisos.
- [T10] Ordem dos avisos: (1) na **data/hora da confirmação** da montagem; (2) **no dia do evento, uma hora antes do início** (lembrete). Exige agendamento (cron).
- [T11] Destinatários: **pais/mães** recebem o time de cada filho; **responsáveis** recebem o próprio time e os times das crianças com quem formam dupla; **jovens** recebem o próprio time.
- [T12] **Brincadeiras de pais e filhos também valem por time.** A **dupla joga pelo time do filho**.
- [T13] **Só crianças e jovens entram nos times.** Adultos (pais, mães, casais) não têm time; participam de pais e filhos pelo time do filho.
- [T14] **Responsável (jovem) deve ficar no mesmo time da criança** com quem forma dupla. Continua valendo que **irmãos não podem estar no mesmo time**.
- [T15] **Equilibrar também por categoria**: cada time com o mesmo número (±1) de crianças e o mesmo número (±1) de jovens.
- [T16] **Imagem do time**: upload pelo administrador; se não informar, usa um **conjunto padrão de cores e ícones**.
- [T17] **Após a confirmação o administrador ainda pode editar.** Ao editar, o WhatsApp é **reenviado somente para quem mudou** (o jovem movido, os pais das crianças movidas e os responsáveis vinculados a elas).

**Consequência de T14 na inscrição (validação preventiva)**
- Ao escolher um responsável para um filho, a busca **exclui jovens já vinculados a um irmão** desse filho em qualquer brincadeira de pais e filhos do evento. Motivo: o responsável precisa ficar no time da criança, e irmãos ficam em times diferentes; vincular o mesmo jovem a dois irmãos seria impossível de montar.
- O mesmo vale ao contrário: um jovem só pode ser responsável de crianças que possam ficar no mesmo time.

**Algoritmo de montagem**
1. Reúne os inscritos elegíveis a times: **crianças (≤ 8) e jovens (solteiros 9–30)**.
2. Agrupa em **unidades inseparáveis**: cada criança + os responsáveis (jovens) vinculados a ela, e, transitivamente, as crianças vinculadas a esses responsáveis. Quem não tem vínculo é uma unidade de 1 pessoa.
3. Valida as unidades: se alguma contiver **irmãos**, a montagem é bloqueada e o painel mostra o conflito para o administrador resolver (trocar o responsável de uma das duplas).
4. Ordena as unidades por tamanho decrescente e idade decrescente e distribui de forma **gulosa balanceada**: cada unidade vai para o time que minimiza o desequilíbrio (contagem de crianças, contagem de jovens e média de idade por categoria), respeitando a restrição de irmãos (o time não pode já ter um irmão de alguém da unidade). Para unidades de 1 pessoa isso equivale à distribuição em serpentina por idade.
5. Semente aleatória por montagem, para "remontar" gerar uma distribuição diferente com o mesmo equilíbrio.
6. Estados da montagem: `rascunho` (montado, editável) → `confirmado` (avisos enviados). Remontar descarta edições manuais com aviso de confirmação. Editar após confirmado gera reenvio só aos afetados (T17).
7. Na edição manual (arrastar e soltar), o painel avisa, sem bloquear, quando a ação viola uma regra: irmãos no mesmo time, responsável separado da criança, times desbalanceados.

**Modelo de dados dos times**
- **Time**: evento, nome, imagem (upload; nulo = usa cor/ícone padrão), cor/ícone padrão, ordem. Quantidade de inscritos é calculada.
- **Membro do time**: time, inscrito (somente crianças e jovens). Único (evento, inscrito).
- **Montagem**: evento, status (rascunho | confirmado), confirmado em, confirmado por.
- **Aviso de time**: evento, inscrito destinatário (com WhatsApp), tipo (confirmação | lembrete 1h antes), status de envio, enviado em.

### Página inicial e divulgação (levantamento fechado em 17/09/2026)
Referência visual: template do designer (`recreativa-design-system/site/prototipo`) e `branding/diretrizes/`. A especificação funcional do designer **não** será implementada; só a ideia da página inicial.
- [P1] `/` passa a ser a **landing page do evento em destaque**: o próximo evento; se não houver, o último realizado.
- [P2] O botão principal ("Me inscrever") leva para `/[slug]` do evento em destaque.
- [P3] O administrador divulga `/` ou `/[slug]`, como preferir; os dois links funcionam sempre.
- [P4] `/[slug]` continua sendo o formulário de inscrição, começando pela tela de boas-vindas.
- [P5] **Evento de `/`** escolhido automaticamente entre os eventos **publicados**: o próximo (o do dia conta); se não houver, o último realizado. Sem evento publicado, `/` mantém a capa atual (logo e aviso).
- [P6] **Publicado** é uma chave do evento, controlada pelo administrador. Evento não publicado **não aparece em `/` nem em `/[slug]`** (nem aceita inscrição). Eventos novos nascem não publicados; os já existentes migram como publicados.
- [P7] **Evento já realizado**: a página continua no ar com uma mensagem padrão de agradecimento e o botão "Ver fotos" (se houver link); o botão de inscrição some.
- [P8] **Todas as seções do template entram**, em uma página só: destaque, números, programação (resumo e completa), antes de vir, regras gerais, brincadeiras, times, dúvidas, fotos e contatos. Seção sem dados não aparece.
- [P9] **Programação completa**: horário de início e fim, título, detalhe, vínculo opcional com brincadeira e marcação de destaque para o resumo.
- [P10] **"Antes de vir"** reaproveita as recomendações (V5). **Regras gerais** é um campo novo de texto rico.
- [P11] **Contatos e dúvidas são por evento**; ao criar um evento, são copiados do evento mais recente para o administrador só ajustar.
- [P12] **Boas-vindas do `/[slug]` sempre aparecem**, com capa, data, horário e local, mesmo sem texto de boas-vindas.

**Premissas**
- Nenhuma página nova (Dúvidas, Sugestões, Fotos): tudo fica na própria `/`, em seções com âncoras.
- Tudo o que o template mostra fixo no HTML (data, horários, textos, contatos) vem do cadastro do evento.
- As "bolhas" do template são as imagens dos times já cadastrados; nada muda na inscrição.

**De onde vem cada bloco do template**

| Bloco | Dado | Situação |
|---|---|---|
| Topo e botão "Me inscrever" | nome, slug, status efetivo (aberto, abre em, encerrado) | já existe |
| Chamada "4ª Recreação de Iguatemi" | subtítulo | **novo** |
| Texto de apoio do destaque | descrição curta (também prévia do link no WhatsApp) | **novo** |
| Ilustrações e "4 equipes disputando" | times: nome, imagem, cor, contagem | já existe |
| "4ª edição" | número da edição | **novo** |
| "13h–18h30 de brincadeira", data, local | data, horários, endereço, link do Maps | já existe |
| "O dia, resumido" e cronograma | programação: horário, título, detalhe, destaque | **novo** |
| "Antes de vir, já separa" | recomendações (hoje só no obrigado e no WhatsApp) | já existe (reuso confirmado) |
| Regras gerais (ex.: brinquedos infláveis) | texto rico | **novo** |
| Dúvidas | perguntas e respostas | **novo** |
| Fotos das edições anteriores | link do álbum | **novo** |
| Rodapé "Fale com a gente" | contatos: nome e WhatsApp | **novo** |
| Imagem ao compartilhar o link | imagem de capa | já existe (**hoje não aparece em lugar nenhum**, apesar da ajuda do campo dizer "topo do formulário") |
| Qual evento vai para `/` | evento publicado ou em preparação | **novo** |

**Dados novos** (detalhe técnico em "Página inicial (F7)")
- **eventos** (colunas): `publicado` boolean (eventos atuais migram como publicados), `edicao` smallint, `subtitulo` text (≤ 80), `descricao` text (≤ 300), `link_fotos` text (https), `regras_gerais` jsonb (texto rico).
- **programacao**: id, evento_id, `hora_inicio`, `hora_fim` (opcional), `titulo`, `detalhe` (ex.: "casais: Sopro do Amor"), `brincadeira_id` (opcional, mesmo evento), `destaque` (entra no resumo), ordem pelo horário.
- **perguntas_frequentes**: id, evento_id, `pergunta`, `resposta` (texto rico), `ordem`.
- **contatos**: id, evento_id, `nome`, `whatsapp` (`^55\d{10,11}$`), `ordem`.
- Leitura pública por uma RPC nova (`obter_pagina_inicial()`), no mesmo padrão das atuais: anônimo nunca lê tabelas.

## Decisões menores confirmadas
- Itens 6 e 7 da mensagem original eram duplicados.
- Brincadeiras **individuais** (um contra o outro): o sistema **não sorteia confrontos**; só lista os participantes. Os confrontos são feitos no dia.

## Pontos ainda em aberto
_(nenhum; página inicial P1–P12 respondida em 17/09/2026: 1 sim, 2 todas as seções, 3 completa, 4 recomendado, 5 por evento, 6 sempre)_

---

# Plano técnico

## Stack (versões verificadas em set/2026)
| Camada | Escolha | Motivo |
|---|---|---|
| App | **Next.js 16.3** (App Router, `src/`), React 19.3, TypeScript strict, **pnpm** | Server Components carregam evento/brincadeiras; Server Actions e Route Handlers para RPC, worker e exportação; deploy Vercel nativo. Em Next 16 o middleware chama-se `proxy.ts`; `after()` roda trabalho pós-resposta. |
| Backend | **Supabase** (Postgres + Auth + Storage), `@supabase/supabase-js` 2.116, `@supabase/ssr` 0.12 | Preferência do usuário; plano gratuito cobre o volume (centenas de inscritos/ano). |
| Validação | **zod 4.6** (`zod/mini` no formulário público) | Mesmo schema no cliente e na Server Action. |
| Estilo | **Kit `branding/` como está** (classes `rc-*`, tokens, tema escuro) + **CSS Modules**. **Sem Tailwind.** Fontes via `next/font/google` (Baloo 2 + Inter + Caveat, conforme o design system do designer). Ícones `lucide-react`. | Um só vocabulário, bundle mínimo, tema escuro por `data-theme` continua funcionando. |
| Editor rico (painel) | **Tiptap 3.31** (`StarterKit` reduzido + `TextStyleKit` para cor), carregado com `next/dynamic` | Negrito, itálico, cor e emojis com pouca configuração. |
| Texto rico (armazenamento) | **JSON do Tiptap em `jsonb`**, validado com zod ao gravar; no público um renderizador próprio com lista branca (`RichText.tsx`, ~60 linhas) | XSS impossível por construção, zero sanitizador no bundle público, e a mesma árvore vira texto do WhatsApp (`*negrito*`). |
| Drag and drop | `@dnd-kit/core` 6.3 + `@dnd-kit/sortable` 10 | Estável, toque e teclado; menu "Mover para…" como alternativa acessível. |
| Exportação | CSV (BOM UTF-8, `;`) sem dependência + XLSX com `write-excel-file` 4.1 | `exceljs` é 10x maior; `xlsx` do npm está abandonado. |
| WhatsApp | **Evolution API v2**: `POST {URL}/message/sendText/{instancia}`, header `apikey`, body `{ number: "55DDDN…", text }` | Instância própria do organizador. |
| Agendamento | **pg_cron + pg_net** (Supabase) chamando `POST /api/tarefas/outbox` a cada minuto com segredo do Vault | Vercel Cron no Hobby roda no máximo 1x/dia sem precisão de minuto: não atende ao lembrete de 1 hora antes. |
| Testes | **Vitest 5** (unitários puros + integração contra Supabase local), **Playwright** (fluxo mobile ponta a ponta) | |
| Dev local | Supabase CLI (`brew install supabase/tap/supabase`) + Docker já instalado | Migrations versionadas em `supabase/migrations`, tipos gerados com `supabase gen types`. |

## Rotas
- Público: `/[slug]` (formulário) e `/[slug]/obrigado`. Slugs reservados: `painel`, `api`, `obrigado`.
- Painel: `/painel/login` e `/painel/redefinir-senha` (únicas rotas públicas do painel; não há cadastro), `/painel/trocar-senha`, `/painel/eventos`, `/painel/eventos/[id]` (painel: status, números e atalhos), `/painel/eventos/[id]/editar` (dados do evento), `/painel/eventos/[id]/brincadeiras[/[bid]]`, `/painel/eventos/[id]/times` (CRUD + quadro de montagem), `/painel/eventos/[id]/inscritos[/[iid]]`, `/painel/usuarios`.
- API: `POST /api/tarefas/outbox` (worker WhatsApp, `Bearer CRON_SECRET`), `GET /api/eventos/[id]/exportar?formato=csv|xlsx` (sessão + RLS).

## Estrutura de pastas
```
app-inscricoes/
├─ branding/                       # kit existente (não alterar; só acrescentar prose.css, table.css, board.css)
├─ supabase/ config.toml (enable_signup = false) · migrations/0001…0010 (inclui 0003_admin_inicial.sql; sem dados fictícios)
├─ src/
│  ├─ proxy.ts                     # refresh de sessão + bloqueio de /painel/*
│  ├─ app/
│  │  ├─ layout.tsx · globals.css (importa branding) · manifest.ts · icon.svg · apple-icon.png
│  │  ├─ (publico)/[slug]/{page.tsx,actions.ts,obrigado/page.tsx}
│  │  ├─ (painel)/painel/login/page.tsx
│  │  ├─ (painel)/painel/(app)/{layout.tsx,eventos/…,usuarios/…}   # cada rota com actions.ts + componentes locais
│  │  └─ api/{tarefas/outbox,eventos/[id]/exportar}/route.ts
│  ├─ lib/
│  │  ├─ supabase/{client.ts,server.ts,admin.ts,types.ts}   # admin.ts é server-only (service role)
│  │  ├─ auth/{perfil.ts,permissoes.ts}   # exigirPerfil(), pode(perfil, acao)
│  │  ├─ env.ts                           # zod valida variáveis no boot
│  │  ├─ eventos/status.ts                # statusEfetivo(evento, totalInscritos) — usado no público e no painel
│  │  ├─ pessoas/{idade.ts,nome.ts,elegibilidade.ts}   # espelho TS das funções SQL
│  │  ├─ texto-rico/{schema.ts,RichText.tsx,paraWhatsapp.ts}
│  │  ├─ times/{tipos.ts,unidades.ts,rng.ts,pontuacao.ts,montar.ts,avaliar.ts,diff.ts,paleta.ts}
│  │  ├─ whatsapp/{evolution.ts,templates.ts,destinatarios.ts,outbox.ts}
│  │  └─ exportacao/{inscritos.ts,csv.ts,xlsx.ts}
│  ├─ features/inscricao/
│  │  ├─ modelo/{tipos.ts,etapas.ts,reducer.ts,regras.ts,schemas.ts,payload.ts,erros.ts}
│  │  ├─ estado/{InscricaoProvider.tsx,useEtapas.ts,useRascunho.ts}
│  │  ├─ ui/{Formulario.tsx,StepShell.tsx,StepTransition.tsx,BarraProgresso.tsx,Resumo.tsx}
│  │  └─ steps/{Nome,DataNascimento,SimNao,Opcoes,Filho,Comida,Brincadeira,PaisFilhos,Whatsapp}Step.tsx
│  └─ components/{TextField,DateField,YesNo,ChoiceCards,GameCard,PersonSearch,VideoEmbed,EditorRico,QuadroTimes}/
└─ tests/ (Vitest) · e2e/ (Playwright)
```
Cada arquivo com no máximo ~250 linhas; a função SQL de inscrição é dividida em helpers, um por migration.

## Modelo de dados (Postgres)
Enums: `tipo_vinculo (principal|conjuge|filho)`, `situacao_dependente (cadastrado|vai_se_cadastrar|nao_quer_cadastrar)`, `tipo_comida (salgado|doce|refrigerante|suco)`, `categoria_brincadeira (casais|jovens|criancas|pais_e_filhos)`, `formato_brincadeira (individual|em_grupo)`, `papel_participante (pessoa|conjuge|filho|pai|mae|responsavel)`, `status_montagem (rascunho|confirmado)`, `tipo_aviso (confirmacao_inscricao|times_confirmacao|times_alteracao|times_lembrete)`, `status_envio (pendente|enviando|enviado|falhou)`, `perfil_usuario (analitico|operador|administrador)`.

Padrão: toda tabela filha carrega `evento_id` e FK composta `(x_id, evento_id)` para impedir mistura entre eventos. Contagens são `count(*)` sob lock (sem contadores materializados).

- **eventos**: id, nome, `slug` unique, `data_evento`, `hora_inicio`, `hora_fim`, `endereco`, `link_maps`, `boas_vindas` jsonb, `agradecimento` jsonb not null, `recomendacoes` jsonb, `inscricoes_inicio`, `inscricoes_fim`, `aberto_manual` bool, `limite_inscritos`, `valor_inscricao` numeric, `capa_path`, `montagem_status`, `montagem_confirmada_em/por`, `montagem_semente`, timestamps. `inicio_em` timestamptz gerado de data+hora em `America/Sao_Paulo`.
- **limites_comida**: `(evento_id, tipo)` pk, `limite`.
- **inscritos**: id, evento_id, `nome_completo`, `nome_normalizado` (coluna gerada por `normalizar_nome()` = lower + unaccent + espaços únicos), `apelido`, `data_nascimento`, `idade` (na data do evento), `casado`, `tem_filhos_menores`, `inscrito_principal_id` (self FK), `vinculo`, `conjuge_situacao`, `filhos_situacao`, `whatsapp` (`^55\d{10,11}$`), `inscrito_em`, `criado_por`. Constraints: `unique (evento_id, nome_normalizado)`; principal ⇔ `inscrito_principal_id is null`; um cônjuge por principal.
- **colaboracoes**: `inscrito_id` pk, evento_id, `tipo`. Uma unidade por inscrito.
- **brincadeiras**: id, evento_id, nome, `foto_path`, `video_url`, `regras` jsonb not null, `categoria`, `limite_participantes`, `formato` (nulo ⇔ casais), `ativo`, `ordem`.
- **participacoes** (1 linha = 1 vaga): id, evento_id, brincadeira_id, categoria, criado_em. **participantes**: `(participacao_id, inscrito_id)` pk, brincadeira_id, `papel`; **`unique (brincadeira_id, inscrito_id)`** cobre todas as unicidades (pessoa, cônjuge, filho, parceiro).
- **times**: id, evento_id, nome, `imagem_path`, `cor_padrao`, `icone_padrao`, ordem; `unique (evento_id, nome)`.
- **membros_time**: `(evento_id, inscrito_id)` pk, `time_id`, **`time_notificado_id`** (último time comunicado; diferença com `time_id` define quem recebe reenvio).
- **avisos_whatsapp** (outbox): id, evento_id, inscrito_id, `tipo`, `telefone`, `contexto` jsonb, `mensagem`, `status`, `tentativas`, `proxima_tentativa_em`, `enviado_em`, `erro`, `id_externo`, **`chave_idempotencia` unique** (`confirmacao:{inscrito}`, `times:{evento}:v{n}:{inscrito}`, `lembrete:{evento}:{inscrito}`).
- **usuarios_painel**: `id` = auth.users, email, nome, `perfil`, `ativo`.
- **Administrador inicial por migration** (`0003_admin_inicial.sql`): insere em `auth.users` + `auth.identities` (`email_confirmed_at = now()`, senha **aleatória** gerada com `gen_random_uuid()`, nunca escrita no repositório) e em `usuarios_painel` com perfil `administrador`. Como o repositório é **público**, não há senha na migration: o primeiro acesso é feito por **"Esqueci minha senha"** na tela de login, que envia o link de redefinição pelo e-mail do Supabase Auth (SMTP embutido basta para esse uso ocasional). O e-mail do administrador inicial fica na migration; usar o e-mail do organizador (a confirmar na implementação).

## Funções Postgres (RPC)
Públicas (anon, `security definer`, `revoke from public; grant to anon`; sem policies em tabelas para anon):
- `obter_evento_publico(slug)` → campos públicos + status efetivo + disponibilidade de comida por tipo.
- `listar_brincadeiras_disponiveis(evento_id)` → ativas com vaga (nunca expõe participantes).
- `buscar_jovens_livres(evento_id, brincadeira_id, termo)` → exige `length(termo) >= 3`; retorna só `id, nome_completo, apelido`; exclui ocupados na brincadeira.
- `verificar_nome_disponivel(evento_id, nome)` → boolean (feedback imediato em E1).
- **`criar_inscricao(p jsonb)`** → grava tudo em uma transação: `select … from eventos where id = … for update` serializa as inscrições do evento; valida status efetivo, limite do evento, nomes (formato + unicidade no evento e no payload), idade na data do evento, comida (idade > 12 e estoque), elegibilidade por categoria, vaga, parceiro livre, responsável jovem não irmão e não vinculado a irmão, WhatsApp obrigatório se houver participação; insere principal → cônjuge → filhos → colaborações → participações → aviso `confirmacao_inscricao`. Erros: `raise exception using message = 'codigo', detail = jsonb` (`inscricoes_fechadas`, `limite_evento`, `nome_duplicado`, `estoque_comida`, `brincadeira_lotada`, `parceiro_ocupado`, `responsavel_invalido`), mapeados em `src/lib/erros-rpc.ts`.
- Payload: `{ evento_id, principal: {nome_completo, apelido, data_nascimento, casado, tem_filhos_menores, conjuge_situacao, filhos_situacao, whatsapp, comida}, conjuge?: {…}, filhos: [{ref, …}], participacoes: [{brincadeira_id, tipo: 'pessoa'|'casal'|'dupla', pessoa?, filho?, parceiro?, papel?}] }`; refs (`principal|conjuge|f1`) resolvidas após os inserts.

Painel (autenticado, RLS): `salvar_inscricao_painel(p jsonb)` reutiliza os mesmos helpers de validação; `salvar_montagem(evento_id, alocacao jsonb, semente)`; `confirmar_montagem(evento_id)` (marca confirmado e enfileira avisos via `destinatarios_times(evento_id)`); `reservar_avisos(n)` (`for update skip locked`); `enfileirar_lembretes()` (chamada pelo pg_cron; insere `times_lembrete` com `on conflict do nothing` quando `inicio_em - now()` está entre 55 e 65 min).

## Segurança
- Público anônimo nunca acessa tabelas: só RPCs, e sempre por Server Actions (o navegador não fala com o Supabase no formulário). Permite acrescentar rate limit/Turnstile depois.
- Painel: Supabase Auth e-mail + senha (magic link descartado: SMTP gratuito limitado). **Somente login: não existe rota de cadastro**, e o auto-cadastro fica desligado no Supabase (`enable_signup = false` no `config.toml` local e no painel do projeto cloud), então nem chamadas diretas à API criam contas. Usuários novos só via `auth.admin.createUser` (service role) na tela de usuários, restrita ao administrador; o novo usuário define a própria senha pelo fluxo "Esqueci minha senha" (`resetPasswordForEmail` → `/painel/redefinir-senha`), então nenhuma senha circula por WhatsApp ou e-mail em texto claro. `perfil_atual()` (`security definer stable`) alimenta as policies: select para qualquer perfil ativo; escrita em inscritos/colaboracoes/participacoes para operador e administrador; demais tabelas e `usuarios_painel` só administrador. `exigirPerfil()` na primeira linha de toda Server Action e `pode(perfil, acao)` esconde botões na UI. Service role só em `admin.ts`: worker e criação de usuários.
- Storage: bucket público `imagens` (`capas/`, `brincadeiras/`, `times/`), 5 MB, jpeg/png/webp; escrita só administrador; upload direto do navegador com redimensionamento client-side (máx. 1600 px).

## Formulário público (features/inscricao)
- **Fluxo como dados**: `ETAPAS: EtapaDef[]` com `id`, `quando(draft, evento)`, `expandir()` (etapas repetidas por pessoa/brincadeira), `componente`, `schema`, `ler/escrever` (lente sobre o `InscricaoDraft`). `montarEtapas(draft, evento)` deriva a lista visível; navegação por `id`, nunca por índice. `useReducer` + Context, sem xstate/zustand. Respostas nunca são apagadas ao voltar; `montarPayload` só inclui etapas visíveis.
- Ordem: nome → apelido → nascimento → casado (idade > 18) → cônjuge (opção, nome, nascimento) → filhos (tem?, opção, N × nome/nascimento, "mais um?") → comida por pessoa > 12 → brincadeiras por pessoa elegível (crianças/jovens; casais só com cônjuge no fluxo) → pais e filhos (uma etapa por brincadeira, monta as duplas; responsável via `PersonSearch` com 3+ caracteres; exclui parceiros já em dupla e responsáveis vinculados a irmãos) → WhatsApp (só se houver participação) → resumo → envio.
- **Transições**: `<ViewTransition>` do React 19.3 (0 kB) com `addTransitionType('avancar'|'voltar')`, deslize 24 px + fade 220 ms; campos com `@keyframes` escalonados; `prefers-reduced-motion` desliga tudo. Isolado em `StepTransition.tsx` para trocar por `motion` se um dia precisar.
- **Performance**: `page.tsx` é Server Component (`force-dynamic`); só `Formulario` é client. Fontes por `next/font`, imagens por `next/image`, vídeo por fachada (thumbnail do YouTube + iframe `youtube-nocookie` ao tocar; Instagram/outros viram cartão "assistir" externo). Meta: First Load JS da rota ≤ 150 kB, Lighthouse mobile ≥ 90. PWA manifest com ícones do kit, sem service worker.
- **Erros do servidor** voltam à etapa certa (`mapearErroParaEtapa`) e `router.refresh()` atualiza vagas/estoque.
- **Rascunho** em `localStorage` (`recreativa:inscricao:{eventoId}`, 24 h, versionado), limpo ao concluir.
- **Acessibilidade**: foco no primeiro controle após a transição, `aria-live` "Pergunta N de M", `role="alert"` nos erros, radios nativos em `rc-choice--card`, combobox acessível na busca.

## Painel
- Layout com `rc-surface-brand`, navegação por evento. Formulários com zod + Server Actions.
- Evento: dados, limites de comida, capa, chave manual abrir/encerrar, indicadores (período, inscritos/limite), badge de status; ao mudar `data_evento` com inscritos, recalcula idades.
- Brincadeiras: CRUD, foto, vídeo URL, `EditorRico`, categoria, limite, formato (oculto em casais), vagas ocupadas.
- Times: CRUD (nome, imagem com fallback cor/ícone de `paleta.ts`), quadro `QuadroTimes` com uma coluna por time, DnD + menu "Mover para…", avisos não bloqueantes (`avaliarAlocacao`), botões Montar / Remontar (confirma descarte) / Salvar / Confirmar (bloqueados até inscrições encerradas e ≥ 2 times), conflito de irmãos com link para a participação.
- Inscritos: lista com busca e filtros, edição (mesmos limites via RPC), status do WhatsApp com reenvio (operador+), exportação CSV/XLSX.
- Usuários: criação via `auth.admin.createUser` (senha aleatória) + perfil (só administrador); ativar/desativar e mudar perfil. Sem auto-cadastro. O usuário define a senha por "Esqueci minha senha".
- Senha: "Esqueci minha senha" no login → e-mail com link → `/painel/redefinir-senha`; e `/painel/trocar-senha` no menu para quem já está logado.

## Montagem de times (módulo puro `src/lib/times`)
`montarTimes({ pessoas, vinculos, times, semente }): Resultado`. Union-find monta unidades criança+responsável; unidades com irmãos → erro `IRMAOS_NA_MESMA_UNIDADE`; `times.length < 2` → `TIMES_INSUFICIENTES`. Ordena unidades (tamanho desc, idade desc, embaralhado com rng semeado) e atribui cada uma ao time de menor custo: `1000·Δcriancas + 1000·Δjovens + Δmédia idade crianças + Δmédia idade jovens`, ignorando times que já têm irmão de alguém da unidade. `avaliarAlocacao` gera avisos (irmãos juntos, responsável separado, desbalanceado). `calcularAfetados(anterior, atual)` usa `time_notificado_id` para reenviar só a quem mudou (o movido, os pais das crianças movidas e os responsáveis vinculados).

## WhatsApp
Outbox → worker `POST /api/tarefas/outbox` (responde 202 e processa em `after()`): `reservar_avisos(20)`, monta texto (`templates.ts`: confirmação com resumo; aviso de times cobrindo pais, responsáveis e jovens; lembrete "começa em 1 hora"), envia com pausa de 1,5 s, grava enviado/falhou com backoff (1, 5, 30 min; 5 tentativas). Disparos: `after()` na inscrição e na confirmação da montagem; pg_cron a cada minuto para retentativas e lembretes; botão "Processar fila" no painel (também o caminho em dev). `WHATSAPP_ENVIO_ATIVO=false` em dev só registra o log.

## Git e GitHub
- Repositório **público** no GitHub: `gh repo create adrianodrix/recreativa-inscricoes --public --source=. --remote=origin --push` (nome ajustável). `gh` 2.89 já autenticado como adrianodrix via SSH; `git` configurado com nome/e-mail e branch padrão `main`.
- **Um só branch, `main`.** Ao concluir cada fase (F0…F6), e em marcos intermediários coerentes, commit direto na `main` e `git push` imediato. Sem git flow, sem PR; o skill `release` não se aplica. Mensagens curtas em pt-BR no imperativo (ex.: `F2: formulário de inscrição com etapas E1–E7`), terminando com `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- **Nada sensível no repositório** (é público): `.gitignore` com `.env*` (exceto `.env.example`), `node_modules`, `.next`, `.vercel`, `supabase/.temp`, `test-results`, `playwright-report`. Segredos só na Vercel, no Supabase (Vault) e nos `.env.local` de cada máquina. Migrations não contêm senhas (ver admin inicial). O kit `branding/` é público por natureza (logo do evento).
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) roda `pnpm typecheck`, `pnpm lint` e `pnpm test` em todo push na `main`; e2e Playwright só manual ou agendado, por depender do Supabase local.
- **Deploy**: Vercel conectada ao repositório GitHub; todo push na `main` gera deploy de produção. Migrations aplicadas com `supabase db push` a partir da máquina local antes do push que depende delas.
- Licença do repositório: a definir pelo usuário (sugestão: MIT, ou sem licença se preferir manter os direitos reservados mesmo público).

## Ambientes
- `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `APP_URL`, `CRON_SECRET`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`, `WHATSAPP_ENVIO_ATIVO`. Validados em `src/lib/env.ts`. Nunca sobrescrever `.env` existente sem perguntar.
- dev: `supabase start` + `supabase db reset`; test: `.env.test` contra o mesmo Supabase local, reset antes da suíte; prod: projeto Supabase cloud + Vercel (Vault com `worker_url` e `cron_secret`, `supabase db push`).

## Página inicial (F7)
Requisitos P1–P12. Visual: template do designer sobre o kit `branding/` (degradê com grão, Baloo 2, Caveat no subtítulo).

**Diferenças entre o plano e o que foi feito**
- "Em preparação" entrou como mais um motivo de `motivo_fechado`, em vez de reescrever `criar_inscricao`: o efeito no formulário público é o mesmo, a montagem de times não muda e o painel ganhou o rótulo "Evento em preparação".
- A prévia saiu da F7.2 para a F7.3, porque reaproveita a página pública.
- `dangerouslyAllowLocalIP` ligado só em desenvolvimento: o Next 16 bloqueia otimizar imagens de IP local, o que quebrava todo upload servido pelo Supabase local.

**Banco — `0014_pagina_inicial.sql`**
- `eventos` ganha: `publicado boolean not null default false` (a migration marca os existentes como `true`), `edicao smallint check (> 0)`, `subtitulo text` (≤ 80), `descricao text` (≤ 300), `link_fotos text` (`^https://`), `regras_gerais jsonb`.
- **programacao**: id, evento_id, `hora_inicio time not null`, `hora_fim time` (nulo ou > início), `titulo` (2–80), `detalhe` (≤ 120), `brincadeira_id` com FK composta `(brincadeira_id, evento_id)` e `on delete set null (brincadeira_id)` (Postgres 17), `destaque boolean default false`. Ordem sempre pelo horário, sem coluna de ordem.
- **perguntas_frequentes**: id, evento_id, `pergunta` (5–160), `resposta jsonb not null` (texto rico), `ordem`.
- **contatos**: id, evento_id, `nome` (2–60), `whatsapp` (`^55\d{10,11}$`), `ordem`.
- RLS igual à de times: leitura para qualquer perfil ativo, escrita só administrador.
- `evento_publico_json(e)`: extrai o JSON que `obter_evento_publico` já monta (mais `subtitulo`, `descricao`, `edicao`), para as duas RPCs não duplicarem campos.
- `obter_evento_publico(slug)` passa a filtrar `publicado`. `/[slug]` e `/[slug]/obrigado` dão 404 para evento não publicado.
- `obter_pagina_inicial()` (anon, `security definer`): escolhe o evento (publicado; menor `data_evento >= hoje` em `America/Sao_Paulo`, senão o maior `data_evento` anterior) e devolve `evento_publico_json` + `programacao[]` + `perguntas[]` + `contatos[]` + `times[]` (nome, imagem, cor, ícone) + `brincadeiras[]` ativas (nome, foto, categoria, formato, lotada). Nunca expõe inscritos.
- `criar_inscricao` recusa evento não publicado (`inscricoes_fechadas`, motivo `nao_publicado`). `motivo_fechado` não muda, porque a montagem de times depende dele; a inclusão pelo painel continua liberada.
- `copiar_contatos_e_duvidas(p_evento_id)` (security invoker): copia do evento mais recente anterior; chamada ao criar evento (P11).
- `pnpm db:types`.

**Módulos puros (`src/lib/pagina-inicial/`, com testes)**
- `fase.ts`: `faseDaPagina(evento, agora)` → `em_breve` (inscrições ainda não abriram) | `abertas` | `encerradas` (motivo) | `realizado` (depois de data + hora de fim, em São Paulo). Reusa `statusInscricoes`.
- `programacao.ts`: `resumoDoDia(itens)` (destaques; sem destaque marcado, os 4 primeiros) e `faixaHorario(inicio, fim)` ("14h30 – 15h15").
- `schema.ts`: zod de programação, pergunta e contato; campos novos em `schemaEvento`.

**Público**
- `src/features/pagina-inicial/`: `carregar.ts` (RPC → tipos) e `PaginaInicial.tsx`, que recebe os dados prontos (reusada na prévia do painel). Seções em Server Components, **sem JS no cliente** (menu do celular e dúvidas com `<details>`): `Topo` (logo horizontal, âncoras das seções presentes, botão), `Destaque` (degradê, subtítulo, título, descrição, botão conforme a fase, imagens dos times), `Numeros` (edição, horário, times), `Programacao` (resumo em cartões + lista completa), `AntesDeVir` (recomendações), `Regras`, `Brincadeiras`, `Times`, `Duvidas`, `Fotos`, `Rodape` (subtítulo, data, local, contatos com `wa.me`). Seção sem dados não renderiza, nem a âncora dela.
- `src/app/page.tsx`: `force-dynamic` (mesmo critério do `/[slug]`); sem evento publicado, mantém a capa atual. `generateMetadata`: título, descrição e imagem de prévia. A imagem é gerada por evento com `next/og` (`opengraph-image.tsx`, degradê da marca, logo, nome, data e local, fontes do kit em `branding/assets/fontes/`); a capa do evento, quando existe, tem preferência.
- `/[slug]`: boas-vindas sempre (`montarEtapas` sem condição); `BoasVindasStep` redesenhado com capa (ou degradê), subtítulo, nome, data, horário, local com Maps, valor (se > 0) e texto; `generateMetadata` com descrição e imagem. Ajuste na ajuda do campo capa.

**Painel**
- `FormularioEvento`: nova seção "Página inicial" (edição, subtítulo, descrição com contador, link das fotos, regras gerais). Se passar de ~250 linhas, dividir em componentes por seção.
- `PainelStatus`: chave **Publicado / Em preparação** (ação `publicar_evento`, só administrador), link `/[slug]`, link `/` quando o evento é o da página inicial e botão **Prévia**.
- `CartaoPaginaInicial` no painel do evento: contagem de itens de programação, dúvidas e contatos, com atalhos.
- Rotas `/painel/eventos/[id]/programacao`, `/duvidas`, `/contatos`: lista + `nova` + `[item]/editar`, no padrão de brincadeiras. Dúvidas e contatos reordenáveis com `ListaOrdenavel`; programação ordenada pelo horário, com seletor de brincadeira e chave de destaque.
- `/painel/eventos/[id]/previa`: `PaginaInicial` com dados lidos pelo cliente autenticado (RLS), faixa "Prévia" no topo. Funciona com o evento ainda não publicado.
- `salvarEvento` (criação): chama `copiar_contatos_e_duvidas` e o evento nasce não publicado.

## Fases de entrega
Cada fase termina com commit e push na `main` (ver "Git e GitHub").
1. **F0 Bootstrap**: `git init` + `.gitignore` + primeiro commit + `gh repo create --public`; Next 16 + kit CSS + fontes; Supabase local com `enable_signup = false`; migrations base (extensões, enums, eventos, usuarios_painel, admin inicial, RLS); `env.ts`; Vitest/Playwright; lint/typecheck; CI no GitHub Actions; Vercel conectada ao repositório. Verificável: repositório público no ar com CI verde, `supabase db reset` limpo cria o admin inicial, `pnpm test` verde, deploy de produção mostrando a logo.
2. **F1 Eventos + painel**: login, "esqueci minha senha" e redefinição, `proxy.ts`, perfis, CRUD de eventos (editor rico, limites, capa), status efetivo, usuários. Verificável: admin inicial define a senha pelo e-mail e entra; `signUp` pela API é recusado; operador não cria evento; `/[slug]` mostra "inscrições fechadas" fora do período.
3. **F2 Formulário núcleo**: inscritos, colaborações, RPCs públicas e `criar_inscricao` (já aceitando participações), etapas E1–E7, resumo, agradecimento, rascunho; lista/edição/exportação de inscritos. Verificável: testes do reducer e da RPC (unicidade, limite, estoque, duas chamadas concorrentes na última unidade).
4. **F3 Brincadeiras**: CRUD, participações, `listar_brincadeiras_disponiveis`, `buscar_jovens_livres`, etapas de brincadeiras, pais e filhos e WhatsApp. Verificável: elegibilidade por categoria, parceiro ocupado, irmão bloqueado, vaga por casal/dupla.
5. **F4 Times**: módulo puro com testes primeiro; CRUD de times; montagem, DnD, confirmação e diff. Verificável: 4 times com 30 crianças e 20 jovens ficam ±1 e média de idade próxima; conflito responsável+irmãos retorna erro estruturado.
6. **F5 WhatsApp**: Evolution, outbox, templates, worker, pg_cron + Vault, lembrete, reenvio, status no painel. Verificável: mensagem chega no número de teste; chave duplicada não reenvia; 5xx entra em retentativa; lembrete enfileirado uma única vez no minuto certo.
7. **F6 Operação**: README (restaurar projeto Supabase pausado, primeiro acesso do admin, rotacionar segredos, aplicar migrations), Lighthouse e bundle analyzer, revisão de acessibilidade.
8. **F7 Página inicial** — **concluída em 17/09/2026** (commits `e409b85`, `13a17ef`, `312596e`, `292c0c2`). Falta só percorrer as telas novas do painel com um organizador logado. Ver "Página inicial (F7)"; as quatro etapas foram:
   - **F7.1 Banco**: migration 0014, RPCs, tipos, schemas e módulos puros com testes. Verificável: `db reset` limpo; `obter_pagina_inicial` escolhe o próximo evento, cai para o último realizado e ignora não publicados; `/[slug]` de evento não publicado dá 404; `criar_inscricao` recusa não publicado.
   - **F7.2 Painel**: campos novos, chave publicar, programação/dúvidas/contatos, cópia ao criar evento e prévia. Verificável: operador e analítico não editam; evento novo nasce não publicado já com contatos e dúvidas do anterior; prévia mostra o evento em preparação.
   - **F7.3 Página inicial `/`**: seções, fases e metadados. Verificável no navegador (celular e desktop, claro e escuro): sem evento publicado; inscrições em breve, abertas, encerradas por limite; evento realizado; seções vazias somem; prévia do link com título, descrição e imagem.
   - **F7.4 Boas-vindas do `/[slug]`**: tela sempre visível com capa e dados do evento. Verificável: fluxo completo de inscrição a partir da `/`; testes de `montarEtapas` atualizados.

## Verificação
- Automatizada: `pnpm typecheck && pnpm lint && pnpm test` (unitários: idade, nome, elegibilidade, reducer/etapas, montagem, templates; integração: RPCs contra Supabase local), `pnpm e2e` (Playwright, iPhone 13: casado com 1 filho até "obrigado"; recarga preservando rascunho; nome duplicado volta à etapa do nome).
- Manual com o navegador integrado em viewport mobile: percorrer o fluxo completo; painel com cada perfil; montar times e conferir avisos; `next build` com First Load JS da rota pública ≤ 150 kB; Lighthouse mobile ≥ 90.
- WhatsApp: instância de teste da Evolution API apontando para o número do organizador.

## Riscos e avisos ao usuário
- **Repositório público**: o e-mail do administrador inicial e o kit de marca ficam visíveis; nenhuma senha, chave ou dado de inscrito entra no git. Commits diretos na `main` sem revisão exigem CI verde antes de cada push.
- **Supabase gratuito pausa após 7 dias sem uso**: antes de abrir inscrições alguém precisa restaurar o projeto (documentado no README).
- **Evolution API**: a instância precisa estar conectada; ritmo de envio limitado para evitar bloqueio do número.
- **Vercel Hobby** é para uso não comercial; evento de igreja se enquadra.
- **LGPD**: nomes e nascimentos de menores; definir retenção após o evento (fora do escopo desta versão).
- **Irmão como responsável** é impossível por construção (T4 + T14); a RPC bloqueia.
- Fuso fixo `America/Sao_Paulo`.

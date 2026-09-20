# ReUse Mobile — Animações, Transições e Gamificação

Evolução acadêmica do aplicativo ReUse em React Native/Expo. A atividade implementa movimento real, transições coerentes e uma camada de gamificação ética para incentivar escolhas sustentáveis sem ranking, pressão ou dark patterns.

Os storyboards e estados percentuais documentados no relatório podem ser reproduzidos como keyframes no Adobe After Effects; nesta entrega, o mesmo plano de movimento foi executado diretamente com a API `Animated` do React Native.

> Trabalho individual de Tamy — **RM552055** — FIAP, 2026.

## Demonstração

- Preview web: https://tamyresogasawara.github.io/reuse-mobile-fiap-sprint-2/
- Repositório: https://github.com/tamyresogasawara/reuse-mobile-fiap-sprint-2
- Relatório final: [`docs/ReUse-Animacoes-Transicoes-Gamificacao.pdf`](docs/ReUse-Animacoes-Transicoes-Gamificacao.pdf)

## Cobertura da atividade

### Animações — 20%

- entrada da boas-vindas com opacidade e deslocamento vertical;
- revelação do cartão de impacto e da grade na tela inicial;
- spring/scale ao favoritar ou remover um item;
- preenchimento animado do progresso de nível;
- celebração após publicar um anúncio, com escala, rotação e opacidade;
- feedback textual acessível em paralelo ao feedback visual.

As animações usam `Animated`, `Easing`, `Animated.timing`, `Animated.spring` e `Animated.sequence`, sem dependências adicionais ou upgrade arriscado de framework.

### Keyframes — 15%

As especificações auditáveis ficam em `src/motion/specs.ts` e no PDF. Cada sequência documenta estado inicial, intermediário e final, duração ou parâmetros físicos, atraso, easing, propriedades, gatilho, justificativa e alternativa para movimento reduzido. Os percentuais indicam o progresso do `Animated.Value`, não tempo de relógio; easing e spring tornam o instante intermediário não linear.

Exemplo — celebração de publicação:

| Estado | Opacidade | Escala | Rotação |
|---|---:|---:|---:|
| 0% | 0 | 0,72 | -5° |
| 70% | 1 | 1,08 | 2° |
| 100% | 1 | 1,00 | 0° |

### Transições — 15%

O stack usa `fade_from_bottom` para preservar continuidade e hierarquia entre telas. Em iOS, `animationDuration` define 280 ms; Android e web seguem o tempo padrão da plataforma porque o native stack só aceita esse ajuste no iOS. Quando o sistema solicita redução de movimento, a navegação usa `none`, os reveals assumem o estado final e os feedbacks continuam disponíveis por texto e cor. Entradas de conteúdo, progresso e celebrações mantêm durações curtas, propriedades leves e uso de driver nativo quando compatível.

### Gamificação — 50%

A tela **Meu impacto** implementa uma fatia funcional do sistema:

- pontos derivados apenas de ações persistidas: 10 por favorito único e 100 por anúncio;
- níveis Semente, Broto, Guardião e Embaixador;
- progresso para o próximo nível;
- missões com objetivo, contagem, estado e recompensa;
- medalhas desbloqueadas e bloqueadas;
- feedback imediato ao favoritar e publicar;
- regras claras de pontuação e antiabuso;
- privacidade local e ausência de ranking público;
- consistência semanal sem punição por pausas;
- acessibilidade com rótulos, live regions e redução de movimento.

A pontuação é recalculada a partir dos dados reais em Async Storage. Remover um favorito remove seus pontos e favoritar o mesmo ID não duplica a recompensa. Cada anúncio distinto vale 100 pontos; “Compartilhe para circular” é uma missão única, então publicações posteriores recebem o feedback neutro “Novo impacto registrado”. Os pontos mostrados nas missões resumem as ações já contabilizadas e não são bônus adicionais.

## Fluxos preservados

1. boas-vindas e descoberta;
2. busca por texto e categoria;
3. detalhes e favoritos persistidos;
4. interesse local sem envio de mensagem;
5. anúncio por câmera/galeria com URI durável no nativo;
6. rascunho e publicação em Async Storage;
7. perfil e Meus anúncios;
8. Meu impacto com pontos, níveis, missões e medalhas.

## Câmera, armazenamento e privacidade

O fluxo usa `expo-image-picker` e `expo-file-system`. Em Android/iOS solicita permissão e copia a imagem para o diretório de documentos antes de persistir a URI. Na web, mantém a URI do seletor como fallback demonstrável. Os erros de permissão, seletor, cópia e persistência geram mensagens diferentes e acionáveis.

| Chave | Conteúdo | Uso |
|---|---|---|
| `@reuse/favorites` | IDs únicos | favoritos e pontos de impacto |
| `@reuse/draft` | título, valor, descrição e URI | rascunho automático |
| `@reuse/listings` | anúncios locais com ID e data | Meus anúncios e pontos de impacto |

Não há backend, credenciais, pagamento, chat real ou transmissão de dados pessoais.

## Estrutura principal

```text
.
├── App.tsx
├── __tests__/
│   ├── App.test.tsx
│   └── gamification.test.ts
├── docs/
│   ├── assets/
│   └── ReUse-Animacoes-Transicoes-Gamificacao.pdf
├── scripts/
│   ├── build-report.py
│   └── capture-screenshots.mjs
└── src/
    ├── gamification/impact.ts
    ├── motion/
    │   ├── specs.ts
    │   └── useReducedMotion.ts
    ├── navigation/
    ├── screens/
    │   ├── ImpactScreen.tsx
    │   └── ...
    ├── state/AppContext.tsx
    └── theme.ts
```

## Como executar

Pré-requisito: Node.js 22 ou versão compatível com Expo SDK 57.

```bash
npm ci
npm start
```

Para navegador:

```bash
npm run web
```

## Validação

```bash
npm test -- --silent
npm run typecheck
npx expo-doctor
npm run export:web
npm run screenshots
```

A suíte contém 21 testes cobrindo navegação, busca, favoritos, falhas de persistência sem recompensa, aviso de rascunho, câmera/galeria, URI durável, publicação inicial e posterior, perfil, gamificação, deduplicação de anúncios persistidos, regras de pontos e preferência de movimento reduzido sem corrida assíncrona. O roteiro Playwright percorre o build de produção em viewport mobile de 390 × 844 px e registra as evidências visuais do app real.

## Limites conscientes

- O protótipo não possui backend, autenticação, pagamento, chat ou ranking público.
- Pontos não têm valor financeiro e não podem ser comprados.
- A sequência semanal é um conceito de consistência sem perda de progresso por pausa.
- A câmera nativa deve ser validada em Android/iOS com Expo Go ou build próprio; no preview web o seletor de arquivo é o fallback.
- `npm audit --omit=dev` reporta 10 avisos moderados transitivos no ferramental nativo do Expo, nenhum alto/crítico. O autofix proposto faria downgrade incompatível do Expo 57 para 46; por isso não foi aplicado. O aplicativo não chama a API vulnerável de `uuid` com buffer.
- Anúncios, rascunhos e favoritos podem ser removidos ao limpar os dados locais.

## Autoria

Tamy — **RM552055** — trabalho individual, FIAP, 2026.

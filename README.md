# ReUse Mobile — Sprint 2

Aplicativo acadêmico em React Native/Expo para compra, venda e troca de itens usados. A Sprint 2 transforma a proposta visual da primeira entrega em uma experiência navegável, com persistência local, fluxo de anúncio e integração com câmera/galeria.

> Trabalho individual de Tamy para a disciplina de Mobile da FIAP, 2026.

## Demonstração

- Preview web: https://tamyresogasawara.github.io/reuse-mobile-fiap-sprint-2/
- Repositório: https://github.com/tamyresogasawara/reuse-mobile-fiap-sprint-2

A versão web demonstra os fluxos e a persistência. Como navegadores não oferecem o mesmo comportamento de câmera do app nativo, o botão **Tirar foto** abre o seletor de imagem como alternativa segura. Em Android/iOS, ele solicita permissão e abre a câmera do dispositivo.

## Telas e fluxos

A navegação usa React Navigation com stack e abas inferiores:

1. **Boas-vindas** — proposta de valor e entrada na experiência.
2. **Início/descoberta** — impacto coletivo e grade de itens próximos.
3. **Busca** — texto, categorias e estado sem resultados.
4. **Detalhes** — condição, preço, descrição, localização, anunciante e favorito.
5. **Favoritos** — itens salvos localmente, incluindo estado vazio.
6. **Anunciar** — formulário acessível e seguro para teclado.
7. **Foto do anúncio** — câmera no dispositivo ou galeria/fallback web, prévia e substituição.
8. **Perfil** — resumo de anúncios, favoritos e privacidade.
9. **Meus anúncios** — itens criados e mantidos no dispositivo.

## Recursos nativos

### Câmera e imagens

O fluxo usa `expo-image-picker`:

- solicita permissão antes de abrir a câmera em Android/iOS;
- mostra orientação quando a permissão é negada;
- permite escolher uma imagem da galeria;
- exibe prévia e ação para substituir a foto;
- usa seleção de arquivo no navegador como fallback demonstrável;
- não envia imagens para servidor externo.

As mensagens de permissão nativas estão declaradas em `app.json`.

### Async Storage

O aplicativo usa `@react-native-async-storage/async-storage` para persistir estado significativo:

| Chave | Conteúdo | Uso |
|---|---|---|
| `@reuse/favorites` | IDs dos itens favoritos | Mantém favoritos após recarregar/reabrir |
| `@reuse/draft` | título, valor, descrição e URI da foto | Salva o rascunho automaticamente durante a edição |
| `@reuse/listings` | anúncios locais com ID e data | Alimenta Perfil e Meus anúncios após reinício |

Os dados são carregados ao iniciar o provider e ficam somente no dispositivo/navegador. Não há backend, credenciais nem dados pessoais reais.

## Melhorias de UI/UX

- hierarquia tipográfica consistente e contraste alto;
- paleta clara com verde sustentável usado como destaque;
- componentes reutilizáveis para cards e ações;
- alvos de toque com rótulos de acessibilidade;
- navegação por abas com estado ativo visível;
- formulários compatíveis com teclado e rolagem;
- feedback para foto, validação e publicação;
- estados vazios de busca, favoritos e anúncios;
- layout limitado em telas largas e responsivo em viewport mobile;
- conteúdo em português brasileiro e textos curtos orientados à ação.

## Estrutura

```text
.
├── App.tsx
├── __tests__/App.test.tsx
├── docs/
│   ├── assets/                         # capturas reais da aplicação
│   └── ReUse-Mobile-Sprint-2.pdf       # relatório final
├── scripts/
│   ├── build-report.py
│   └── capture-screenshots.mjs
└── src/
    ├── components/ProductCard.tsx
    ├── data/items.ts
    ├── navigation/
    │   ├── MainTabs.tsx
    │   └── types.ts
    ├── screens/
    │   ├── WelcomeScreen.tsx
    │   ├── HomeScreen.tsx
    │   ├── SearchScreen.tsx
    │   ├── DetailScreen.tsx
    │   ├── FavoritesScreen.tsx
    │   ├── CreateListingScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── MyListingsScreen.tsx
    ├── state/AppContext.tsx
    └── theme.ts
```

## Como executar

Pré-requisito: Node.js 22 ou versão compatível com o Expo SDK 57.

```bash
npm install
npm start
```

Para abrir diretamente no navegador:

```bash
npm run web
```

## Validação

```bash
npm test
npm run typecheck
npx expo-doctor
npm run export:web
```

Os testes exercitam navegação, busca, favoritos, persistência com Async Storage, captura/seleção de imagem, publicação local, perfil e Meus anúncios. O script `npm run screenshots` percorre o build web real em viewport de 390 × 844 px e gera as nove capturas usadas no relatório.

## Limites do protótipo

- Não há backend, pagamento, chat, autenticação real ou publicação remota.
- Os anúncios e favoritos são locais e podem ser removidos ao limpar os dados do app/navegador.
- O preview web usa a galeria como fallback da câmera; a câmera nativa deve ser validada em Android/iOS com Expo Go ou build próprio.

## Autoria

Tamy — trabalho individual, FIAP, 2026.

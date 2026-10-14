# Revisão técnica — Universitur

Revisão realizada em 14/10/2026. O projeto existente foi refatorado; o visual, conteúdo, trilha sequencial, GPS, navegação a pé, avatar, simulação com curvas, chegada por proximidade, painel por gestos, progresso local e conclusão com a coruja foram mantidos.

## Problemas encontrados e correções

| Problema                                                                                                | Correção                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| URLs `/images/...` ignoravam a base `/UniversiTur/` do GitHub Pages.                                    | URLs locais construídas com `import.meta.env.BASE_URL`; testes cobrem base raiz e subdiretório.                                              |
| GPS antigo podia atualizar posição/modo ou desbloquear etapas após pausa, reset ou início da simulação. | Identificação de cada sessão de acompanhamento; callbacks de sessões canceladas são ignorados.                                               |
| Pedidos de simulação podiam terminar depois de cancelados.                                              | AbortController, invalidação de sessão e verificações antes de iniciar/avançar a animação.                                                   |
| Pedidos de rota e recursos não tinham controle consistente na desmontagem.                              | Invalidação e cancelamento de requisições e frames; limpeza de mapa, observador e referências Leaflet.                                       |
| Validação de resposta externa aceitava coordenadas ou métricas inválidas.                               | Validação de latitude/longitude, geometria, distância e duração antes de desenhar/simular a rota.                                            |
| GPS e simulação usavam controles de timeout/frequência separados.                                       | Timeout de 12 segundos e limite compartilhado de um início por segundo no serviço de pedestres; cancelamentos não acumulam reservas futuras. |
| Falha de rota na mesma posição podia impedir nova tentativa mesmo após recuperar a conexão.             | Nova leitura do GPS permite repetir após dez segundos, sem disparar pedidos em cada quadro.                                                  |
| A linha do caminho era removida/recriada a cada quadro da simulação.                                    | Geometria da rota permanece no mapa durante a animação; apenas o avatar muda de posição.                                                     |
| O arquivo principal misturava interface, GPS, armazenamento, matemática e mapa.                         | Componentes e hooks separados por responsabilidade; entrada reduzida à montagem do React.                                                    |
| CSS e JSX compactados dificultavam revisão e manutenção.                                                | Formatação padronizada; regras de estilo existentes preservadas.                                                                             |
| Ausência de comandos reproduzíveis de qualidade e cobertura limitada.                                   | ESLint, Prettier, scripts de verificação, testes de regras e teste de integração no navegador.                                               |

## Compatibilidade e escopo

- Preservados `base: '/UniversiTur/'`, `homepage`, `predeploy` e `deploy` configurados pelo usuário. Nenhuma publicação foi executada.
- Mantidos o provedor de rotas de pedestres, integração com Google Maps, tiles, fotos, fontes e contratos de dados das paradas.
- Mantida a chave `universitour-sequential-v1`; a correção do nome do produto não apaga progresso existente.
- Sem novo framework ou dependência de execução. ESLint, regras de hooks e Prettier são ferramentas de desenvolvimento.
- A aplicação é estática e não possui backend, autenticação, banco de dados ou credenciais no código de aplicação revisado. Não foram adicionadas camadas para funcionalidades inexistentes.
- Tipagem estática não foi introduzida: o projeto continua em JavaScript. Validações em fronteiras de dados e testes cobrem os comportamentos relevantes.

## Arquivos

- Entrada e composição: `src/main.jsx`, `src/App.jsx`, `index.html`.
- Componentes: `src/components/CampusMap.jsx`, `TrailSheet.jsx`, `PlaceDialog.jsx`, `CompletionScreen.jsx`, `Photo.jsx`.
- Hooks: `src/hooks/useTrailNavigation.js`, `useTrailSheet.js`, `src/useWalkingRoute.js`.
- Regras e utilitários: `src/trail.js`, `geography.js`, `routeMovement.js`, `walkingRouting.js`, `assets.js`, `data.js`.
- Estilos: `src/style.css` (formatação).
- Qualidade e configuração: `package.json`, `package-lock.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `vite.config.js` (formatação, base preservada).
- Testes: `tests/geography.test.js`, `trail.test.js`, `routeMovement.test.js`, `walkingRouting.test.js`, `tests/browser/smoke.mjs`.
- Documentação: `README.md`, este relatório.

## Validações

- `npm run lint`: executado, sem erros.
- `npm run format:check`: executado, todos os arquivos aprovados.
- `npm test`: regras de progresso, localStorage indisponível/corrompido, coordenadas e distâncias, URLs locais, movimento nas curvas, chegada antecipada, grafo de pedestres, resposta inválida, cancelamento e erro HTTP. Os cinco arquivos contêm 18 casos; execução direta dos arquivos permite ver os casos individuais neste ambiente.
- `npm run build`: executado com sucesso com a base do GitHub Pages.
- `npm run test:browser`: executado no servidor de desenvolvimento e no preview do build de produção; Chrome headless com GPS e serviço de rotas simulados; solicitações automáticas, callbacks antigos, cancelamento pendente, rota estável durante movimento, ordem das cinco etapas, imagens locais, responsividade, conclusão, revisita e reset.
- `git diff --check`: executado, sem problemas de whitespace.
- Comparação estrutural do CSS antes/depois: as 843 declarações mantêm ordem e valores; as diferenças são apenas formatação.
- Auditoria completa de dependências e auditoria separada de produção, descritas abaixo.

## Pendências e limites

1. **GPS e coordenadas no campus:** coordenadas ainda são aproximadas. Os testes usam GPS controlado e não substituem validação física dos locais, acessos e precisão em dispositivos reais. A revisão não inventou coordenadas nem mudou o conteúdo para encobrir essa limitação.
2. **Dependências de desenvolvimento:** `npm audit` reportou cinco alertas de severidade alta na cadeia `gh-pages → globby → fast-glob → micromatch → braces`. O [aviso GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) informa que não há versão corrigida de `braces`. O npm sugere downgrade do `gh-pages` para 6.1.1; isso não foi aplicado automaticamente porque alteraria a configuração de publicação mantida pelo usuário. Os padrões de publicação atuais são locais e fixos, sem entrada de padrões pelo visitante do app. `npm audit --omit=dev` retornou zero vulnerabilidades. Reavaliar quando houver atualização compatível; não executar `npm audit fix --force` sem revisar o impacto.
3. **Serviços externos:** imagens remotas e roteamento real dependem dos provedores e dos caminhos disponíveis no OpenStreetMap. Os testes de integração usam respostas controladas; não certificam disponibilidade externa ou acessibilidade de todos os caminhos.

## Atualização do roteiro e favicon

O favicon passou a ser declarado com a base do Vite. A ordem atual foi selecionada entre 24 sequências pelas distâncias a pé do roteador: Reitoria → Biblioteca → Convivência → ECT → CB. Consulte [ROTEIRO.md](ROTEIRO.md) para a matriz, estimativas e critérios. Visitas existentes são preservadas mesmo quando ficam fora do prefixo da nova ordem; apenas o primeiro ponto ainda não visitado pode registrar uma nova chegada. O fluxo completo e o favicon foram novamente validados no Chrome com o build de produção.

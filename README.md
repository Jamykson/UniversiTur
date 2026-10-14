# Universitur

Trilha a pé pelo Campus Central da UFRN em Natal, com React, JavaScript, Tailwind CSS 4, Vite e Leaflet. Interface mobile first, acompanhamento por GPS, progresso local, simulação pelo caminho e cinco paradas em sequência.

## Desenvolvimento

Requer Node.js 20.18 ou superior.

```bash
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, incluindo `/UniversiTur/`. A configuração de base e os comandos de publicação existentes foram preservados para o GitHub Pages.

```bash
npm run check         # lint, formatação, testes e build
npm run lint
npm test
npm run format:check
npm run format        # aplica a formatação
npm run build
npm run preview
```

`npm run deploy` mantém o fluxo existente com `gh-pages`, precedido pelo build. Esse comando publica o site; não faz parte dos testes.

## Uso

1. O app abre no mapa e solicita a localização. **Explorar com GPS** permite tentar novamente.
2. A ordem é fixa: **Reitoria → ECT → CB → Biblioteca → Centro de Convivência**. Apenas a etapa atual pode registrar uma chegada.
3. O GPS libera a parada a até 45 metros, com precisão informada de até 80 metros. O lugar abre automaticamente e o próximo caminho fica disponível.
4. **Simular** usa o mesmo trajeto a pé do mapa. O avatar percorre suas curvas em até 14 segundos e chega nas proximidades: normalmente a 30 metros. Um final ajustado pelo serviço de rotas é aceito dentro de 45 metros da parada. Uma falha no trajeto não registra visita.
5. Arraste a alça para baixo para minimizar o painel; para cima, restaure os controles ou exiba todas as paradas. A alça também aceita toque e teclado. Não há botões extras de expansão/recolhimento.
6. Arrastar o mapa libera a câmera. O botão de localização volta a acompanhar o avatar. **Pausar passeio** interrompe o GPS ou a simulação.
7. Ao concluir, a coruja branca apresenta sua conquista. É possível revisitar os lugares, reabrir a conquista pelo contador 5/5 ou recomeçar. Uma trilha já concluída não solicita GPS ao abrir o app.

## Organização

```text
src/
  main.jsx                  Entrada, estilos e montagem do React
  App.jsx                   Composição da interface
  components/               Mapa, painel, fotos, detalhes e conclusão
  hooks/useTrailNavigation  GPS, simulação e ciclo da jornada
  hooks/useTrailSheet        Gestos e posições do painel
  useWalkingRoute.js        Atualização e cancelamento de rotas no React
  walkingRouting.js         Comunicação, limites e validação do serviço de rotas
  trail.js                  Ordem, desbloqueio e persistência do progresso
  geography.js              Coordenadas, distâncias e direção
  routeMovement.js          Movimento pelos trechos e chegada por proximidade
  data.js                   Conteúdo e coordenadas das cinco paradas
  assets.js                 URLs locais compatíveis com a base do Vite
  playerIcon.js              Avatar vetorial
  style.css                 Aparência e regras responsivas
```

A chave existente `universitour-sequential-v1` foi mantida para preservar visitas salvas. Progresso inválido é normalizado; a indisponibilidade do localStorage não impede o passeio em memória. A simulação também altera esse progresso.

## Testes de navegador

O teste usa GPS e respostas de rotas controlados, sem dependências adicionais de automação. Inicie o Vite e uma instância local do Chrome com depuração:

```bash
npm run dev
# Em outro terminal:
google-chrome --headless --disable-gpu --no-first-run --user-data-dir=/tmp/universitur-browser-test --remote-debugging-port=9228 about:blank
# Em outro terminal:
npm run test:browser
```

Por padrão, acessa `http://127.0.0.1:5173/UniversiTur/` e a depuração em `http://127.0.0.1:9228`. Para alterar:

```bash
APP_URL=http://127.0.0.1:4173/UniversiTur/ npm run test:browser
```

O teste verifica callbacks de GPS atrasados, pausa, cancelamento de pedidos, rotas preservadas durante a animação, chegada por proximidade, ordem das etapas, imagens locais, telas de 320×568 a 1280×800, conclusão, revisita e reinício. Feche a instância de depuração após o teste. O screenshot de conclusão é salvo em `/tmp/universitur-refactor-completion.png`.

## Dados, privacidade e limites

- **Coordenadas aproximadas:** valide as entradas dos edifícios em `src/data.js` antes de usar a detecção de chegada no campus. As durações das visitas são estimativas editoriais.
- **GPS:** exige localhost ou HTTPS e autorização do navegador; funciona enquanto a página está aberta. A posição não é persistida pelo app.
- **Rotas:** o serviço público FOSSGIS/OSRM usa o grafo de pedestres `/routed-foot/`. O trecho `driving` da URL é um token da API desse servidor; não muda o grafo para automóveis. Origem e destino são enviados a esse provedor, conforme sua [política](https://routing.openstreetmap.de/about.html). Os pedidos têm timeout de 12 segundos e limite compartilhado de um início por segundo. Respostas antigas ou inválidas são descartadas. Após falha, uma nova atualização do GPS permite tentar novamente após dez segundos.
- **Sem rota disponível:** a linha pontilhada indica apenas direção em linha reta, não um caminho acessível. O roteador depende das vias cadastradas e não garante acesso a todos os caminhos do campus.
- **Serviços externos:** mapas, fontes e fotos externas dependem de internet. O link de navegação a pé abre o Google Maps com o destino escolhido.
- **Conteúdo:** [Campus Virtual UFRN](https://campusvirtual.ufrn.br/) e [mapa oficial](https://www.ufrn.br/resources/documentos/Mapa%20do%20Campus%20Central%20-%20Natal%20RN.pdf). Reitoria, biblioteca e convivência usam fotos dos respectivos lugares. ECT e CB usam imagens de contexto, identificadas nas legendas. A Reitoria e a coruja ficam no projeto; as outras fotos são remotas e têm estado alternativo em caso de falha.
- **Créditos:** © OpenStreetMap contributors; rotas FOSSGIS. Coruja gerada a partir da referência fornecida pelo usuário. Projeto independente, sem vínculo institucional.

Os resultados da revisão e as pendências estão em [docs/REVIEW.md](docs/REVIEW.md).

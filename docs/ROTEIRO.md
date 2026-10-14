# Ordem da trilha a pé

Em 14/10/2026, foram consultadas as distâncias a pé entre os cinco pontos no [roteador FOSSGIS/OSRM](https://routing.openstreetmap.de/about.html), usando o grafo `/routed-foot/` e as coordenadas atuais de `src/data.js`.

Mantendo a Reitoria como ponto inicial, foram comparadas todas as 24 permutações das outras quatro paradas. O objetivo é a menor soma das distâncias de caminhada em um trajeto aberto, sem retorno obrigatório à Reitoria. O percurso da localização do visitante até a Reitoria permanece igual em todas as alternativas e não altera a melhor ordem.

| Trecho                             | Distância estimada a pé |
| ---------------------------------- | ----------------------: |
| Reitoria → Biblioteca Zila Mamede  |                 432,5 m |
| Biblioteca → Centro de Convivência |                 476,8 m |
| Convivência → ECT                  |                 294,1 m |
| ECT → Centro de Biociências        |                 509,9 m |
| **Total**                          |            **1713,3 m** |

A ordem anterior (Reitoria → ECT → CB → Biblioteca → Convivência) somava 2670 m na mesma matriz. A redução é de 956,7 m, aproximadamente 36%.

A matriz consultada, com IDs e coordenadas, está em [route-distances.json](route-distances.json). O teste `tests/itinerary.test.js` compara as 24 alternativas e detecta alterações nas coordenadas que exijam nova avaliação. A ordem é definida no projeto; o app continua calculando cada trecho a pé a partir da posição atual. As distâncias podem mudar com atualizações do mapa, acessos e coordenadas; não representam uma medição física no campus.

A chave de progresso foi mantida. Visitas válidas da ordem antiga são preservadas; a próxima parada é o primeiro local ainda não visitado na nova sequência. A numeração do painel corresponde à posição real da parada no roteiro, mesmo quando há visitas antigas a pontos posteriores.

O favicon foi adicionado em `public/favicon.svg`. A declaração `%BASE_URL%favicon.svg` no HTML produz `/UniversiTur/favicon.svg` no build e evita a busca implícita por `/favicon.ico` na raiz do domínio.

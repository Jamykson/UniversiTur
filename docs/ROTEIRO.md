# Ordem da trilha a pé

Em 14/10/2026, foram consultadas as distâncias a pé entre os cinco pontos no [roteador FOSSGIS/OSRM](https://routing.openstreetmap.de/about.html), usando o grafo `/routed-foot/` e as coordenadas atuais de `src/data.js`.

Mantendo a Reitoria como ponto inicial, foram comparadas todas as 24 permutações das outras quatro paradas. O objetivo é a menor soma das distâncias de caminhada em um trajeto aberto, sem retorno obrigatório à Reitoria. O percurso da localização do visitante até a Reitoria permanece igual em todas as alternativas e não altera a melhor ordem.

| Trecho                               | Distância estimada a pé |
| ------------------------------------ | ----------------------: |
| Reitoria → Centro de Convivência     |                 234,8 m |
| Convivência → Biblioteca Zila Mamede |                 262,1 m |
| Biblioteca → ECT                     |                 609,6 m |
| ECT → Centro de Biociências          |                 509,9 m |
| **Total**                            |            **1616,4 m** |

O Centro de Convivência foi corrigido para `[-5.838975, -35.199798]`, segundo a referência da RNP para o PoP-RN situado nesse edifício, na [lista de endereços dos pontos de presença, página 5](https://plataforma.rnp.br/arquivos/documents/ANEXO%20II%20-%20Lista%20de%20Sites%20-%20Infovia%20PI.pdf?VersionId=PeDGTcpBoWG99bVOAYse8dbc9zKzj6wz). O ponto anterior era `[-5.8415, -35.2003]`.

Com a correção, a sequência Reitoria → Biblioteca → Convivência → ECT → CB soma 1962,3 m. A nova ordem reduz esse percurso em 345,9 m, aproximadamente 18%. A sequência original Reitoria → ECT → CB → Biblioteca → Convivência soma 2455,3 m usando as mesmas coordenadas corrigidas.

A matriz consultada, com IDs e coordenadas, está em [route-distances.json](route-distances.json). O teste `tests/itinerary.test.js` compara as 24 alternativas e detecta alterações nas coordenadas que exijam nova avaliação. A ordem é definida no projeto; o app continua calculando cada trecho a pé a partir da posição atual. As distâncias podem mudar com atualizações do mapa, acessos e coordenadas; não representam uma medição física no campus.

A chave de progresso foi mantida. Visitas válidas da ordem antiga são preservadas; a próxima parada é o primeiro local ainda não visitado na nova sequência. A numeração do painel corresponde à posição real da parada no roteiro, mesmo quando há visitas antigas a pontos posteriores.

O favicon foi adicionado em `public/favicon.svg`. A declaração `%BASE_URL%favicon.svg` no HTML produz `/UniversiTur/favicon.svg` no build e evita a busca implícita por `/favicon.ico` na raiz do domínio.

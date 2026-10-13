# Universitur

Passeio interativo pelo Campus Central da UFRN em Natal, construído com React, JavaScript, Tailwind CSS 4 e Vite. Interface responsiva em português, com mapa Leaflet, fotos, progresso persistido neste navegador e modo de simulação.

## Executar

Instale Node.js 22 ou superior e execute na pasta do projeto:

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite. Para gerar os arquivos de produção:

```bash
npm run build
npm run preview
```

## Explorar

- O site abre direto no mapa em tela cheia e solicita a localização automaticamente. Permita o GPS ou clique em **Explorar com GPS** para tentar novamente. O navegador acompanha a posição apenas enquanto a página está aberta.
- A trilha segue uma ordem fixa: Reitoria → ECT → CB → Biblioteca → Centro de Convivência. Apenas a etapa atual está liberada; chegar em outro ponto não avança o progresso.
- A chegada a menos de 45 metros da etapa liberada abre informações, registra a visita e desbloqueia o próximo caminho quando a precisão indicada pelo GPS é de até 80 metros.
- **Simular** usa a mesma rota a pé desenhada no mapa e move o avatar por seus trechos e curvas em até 14 segundos, após o cálculo do caminho. A simulação encerra nas proximidades (30 metros), abre as informações e libera a próxima etapa sem exigir o ponto exato; finais de rota ajustados pelo serviço de mapas são aceitos dentro da tolerância de 45 metros. A direção do avatar acompanha cada trecho. Se não houver caminho disponível, a simulação informa a falha e permite tentar novamente. Ao chegar, abre as informações; **Próxima** continua o passeio.
- O painel inferior pode ser expandido para ver as cinco paradas. Os marcadores e a lista abrem informações sem marcar visita. O botão de caminho abre o Google Maps com navegação a pé.
- **Reiniciar trilha** limpa o progresso local.

## Limites e dados

As coordenadas em `src/data.js` são aproximações iniciais: valide as entradas de cada edifício no campus antes de usar a detecção de chegada em produção. O trajeto a pé é calculado pelo serviço público FOSSGIS/OSRM usando os caminhos cadastrados no OpenStreetMap. Se não estiver disponível, a linha pontilhada indica apenas a direção em linha reta. O serviço não garante o acesso a todos os caminhos do campus. A duração é uma estimativa editorial.

GPS exige localhost ou HTTPS e autorização do navegador. A localização fica no estado da página e não é persistida. Para calcular o trajeto, a posição e o destino são enviados ao serviço externo routing.openstreetmap.de; consulte sua [política](https://routing.openstreetmap.de/about.html). Apenas os IDs das paradas visitadas ficam em localStorage, na chave `universitour-sequential-v1`. O progresso anterior da versão por proximidade não é reutilizado. A simulação também altera esse progresso. Google Maps recebe o destino ao abrir o link; mapas, fontes e imagens usam provedores externos e dependem de internet.

Fotos e referências: [Campus Virtual UFRN](https://campusvirtual.ufrn.br/). Reitoria, biblioteca e convivência têm fotos dos respectivos locais. Para ECT e CB são usadas imagens de contexto (Complexo Tecnológico de Engenharia e Departamento de Ecologia), identificadas nos detalhes. A foto da Reitoria é local; as demais são carregadas do portal, com estado alternativo em caso de falha.

Mapa-base: © OpenStreetMap contributors. Unidades confirmadas no [mapa oficial da UFRN](https://www.ufrn.br/resources/documentos/Mapa%20do%20Campus%20Central%20-%20Natal%20RN.pdf). Projeto independente, sem vínculo institucional.

## Verificação neste ambiente

Build de produção validado com `npm run build`. Testes no Chrome headless verificaram ausência de transbordamento horizontal e acesso ao botão principal em 320×568, 390×844, 844×390 e 1280×800. A simulação foi testada do movimento do avatar até a abertura automática das informações, persistência da visita e expansão/recolhimento do painel, sem exceções de execução. A detecção real de chegada precisa ser validada em um dispositivo com GPS no campus.

A interface usa CSS mobile first, altura dinâmica (`100dvh`), áreas seguras de tela e controles de toque. O avatar interpola as atualizações do GPS, com direção calculada pelo deslocamento. Arrastar ou dar zoom libera a câmera; o botão de localização volta a acompanhar. **Pausar passeio** interrompe o GPS ou a simulação. O tema usa o azul `#17457e` da referência. A apresentação é um mapa 2D com marcadores estilizados, inspirado na exploração do Pokémon GO.

## Validação da trilha sequencial

Build e testes da regra de progresso passaram. Teste no Chrome com GPS e respostas do serviço de rotas simulados validou: solicitação de localização na abertura, destino inicial na Reitoria, quatro etapas bloqueadas, prevenção de chegadas fora de ordem, desbloqueio das cinco paradas, conclusão e tema azul, sem exceções de execução. O serviço externo de rotas e o GPS real no campus ainda precisam de validação em campo.

Testes da movimentação: `node --test tests/routeMovement.test.js`. Validam passagem pelas curvas, velocidade proporcional à distância dos trechos, pontos duplicados e limites do percurso.

Teste no Chrome com uma rota curva simulada confirmou que o caminho permanece no mapa durante a animação, sem recálculo, com chegada e desbloqueio sequencial. A falha do serviço de rotas impede a movimentação e não registra visita.

## Painel do mapa

Arraste a alça para baixo para minimizar o painel, mantendo só o nome da parada; arraste para cima para restaurar os controles. Cada gesto muda uma posição do painel. A alça também aceita toque ou ativação pelo teclado. Arraste a alça para cima novamente para exibir todas as paradas. Testado no Chrome em larguras de 320, 390 e 844 pixels, incluindo gestos de toque; o painel minimizado ocupou 88 pixels na tela de 390×844.

## Conquista ao concluir

Após a quinta parada, feche as informações do último lugar ou toque em **Ver minha conquista** para abrir a tela de celebração com a coruja branca. **Revisitar minhas descobertas** volta à lista; o contador 5/5 reabre a conquista. **Começar uma nova trilha** limpa o progresso. Ao abrir o app com uma trilha já concluída, a conquista aparece sem solicitar GPS.

Mascote em `public/images/coruja-conquista.png`: ilustração gerada a partir da referência fornecida pelo usuário, com fundo transparente. Tela verificada no Chrome em 320×568, 390×844, 844×390 e 1280×800, incluindo carregamento da imagem, revisita e reinício.

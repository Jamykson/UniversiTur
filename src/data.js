import { publicAsset } from './assets.js';
export { distance, formatDistance } from './geography.js';

export const stops = [
  {
    id: 'reitoria',
    name: 'Reitoria',
    category: 'ARQUITETURA & HISTÓRIA',
    short: 'O ponto de partida de muitas histórias.',
    coords: [-5.8392, -35.2014],
    image: publicAsset('images/reitoria.jpg'),
    description:
      'Projetada pelo arquiteto Carlos Bross e inaugurada em 1979, a Reitoria reúne a administração central da UFRN. Observe os volumes do edifício e a relação da arquitetura com os espaços abertos do campus.',
    tip: 'Reserve um momento para observar a arquitetura pelo lado de fora.',
    duration: 8,
  },
  {
    id: 'ect',
    name: 'Escola de Ciências e Tecnologia',
    tag: 'ECT',
    category: 'CIÊNCIA & INOVAÇÃO',
    short: 'Onde novas ideias ganham forma.',
    coords: [-5.8436, -35.1995],
    image: 'https://campusvirtual.ufrn.br/uploads/8cbea830a685b59bc87cb72ee37eddc4.jpg',
    caption: 'Imagem do campus · Complexo Tecnológico de Engenharia',
    description:
      'A ECT é uma das paradas para conhecer o universo da ciência e da tecnologia na UFRN. Descubra um ambiente de formação, encontros e ideias conectado à vida universitária.',
    tip: 'Explore os espaços externos e respeite as atividades acadêmicas.',
    duration: 10,
  },
  {
    id: 'cb',
    name: 'Centro de Biociências',
    tag: 'CB',
    category: 'NATUREZA & DESCOBERTA',
    short: 'Um encontro com a ciência da vida.',
    coords: [-5.8423, -35.2028],
    image: 'https://campusvirtual.ufrn.br/uploads/fafc1e2d9fe6d6c5515d724074c083b3.jpg',
    caption: 'Departamento de Ecologia · Campus Virtual UFRN',
    description:
      'O Centro de Biociências conecta o estudo da vida à pesquisa e ao ensino. Biologia, ecologia e biodiversidade fazem parte deste capítulo do passeio pelo campus.',
    tip: 'Observe a vegetação do caminho e faça uma pausa à sombra.',
    duration: 10,
  },
  {
    id: 'biblioteca',
    name: 'Biblioteca Zila Mamede',
    category: 'CULTURA & CONHECIMENTO',
    short: 'Milhares de histórias. Um lugar para descobrir.',
    coords: [-5.8407, -35.2011],
    image: 'https://campusvirtual.ufrn.br/uploads/88e4a2b8e952a7a55fd90838fff5161c.jpg',
    description:
      'A Biblioteca Central Zila Mamede nasceu em 1959 como Serviço Central de Biblioteca. Hoje, é uma referência de conhecimento e memória na universidade.',
    tip: 'Antes de entrar, consulte os horários e as regras de visitação.',
    duration: 10,
  },
  {
    id: 'convivencia',
    name: 'Centro de Convivência',
    category: 'ENCONTROS & VIDA NO CAMPUS',
    short: 'Uma pausa para sentir a universidade.',
    coords: [-5.8415, -35.2003],
    image: 'https://campusvirtual.ufrn.br/uploads/aa41cbed731d1ea143b581e9f52fb265.jpg',
    description:
      'O Centro de Convivência Djalma Marinho teve sua obra concluída em 1982. Um espaço de encontros que faz parte da vida cotidiana do campus e encerra esta trilha com uma pausa.',
    tip: 'Aproveite para descansar e trocar impressões sobre o passeio.',
    duration: 7,
  },
];

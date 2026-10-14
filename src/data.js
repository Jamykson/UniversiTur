import { publicAsset } from './assets.js';
export { distance, formatDistance } from './geography.js';

export const stops = [
  {
    id: 'reitoria',
    name: 'Reitoria',
    category: 'ARQUITETURA & HISTÓRIA',
    short: 'O ponto de partida de muitas histórias.',
    coords: [-5.8392, -35.2014],
    image: publicAsset('images/reitoria-campus.jpg'),
    caption: 'Foto: Marcos Elias de Oliveira Júnior · Wikimedia Commons · CC0',
    imageSource: 'https://commons.wikimedia.org/wiki/File:Reitoria_-_UFRN,_Natal_(RN).jpg',
    description:
      'Projetada pelo arquiteto Carlos Bross e inaugurada em 1979, a Reitoria reúne a administração central da UFRN. Observe os volumes do edifício e a relação da arquitetura com os espaços abertos do campus.',
    tip: 'Reserve um momento para observar a arquitetura pelo lado de fora.',
    duration: 8,
  },
  {
    id: 'convivencia',
    name: 'Centro de Convivência',
    category: 'ENCONTROS & VIDA NO CAMPUS',
    short: 'Uma pausa para sentir a universidade.',
    // Referência RNP: Centro de Convivência, sede do PoP-RN.
    coords: [-5.838975, -35.199798],
    image: publicAsset('images/convivencia.jpg'),
    caption: 'Restaurante da APURN, no Centro de Convivência · Foto: APURN',
    imageSource: 'https://www.apurn.org.br/espacos',
    description:
      'O Centro de Convivência Djalma Marinho teve sua obra concluída em 1982. Um espaço de encontros que faz parte da vida cotidiana do campus e convida a uma pausa entre as descobertas.',
    tip: 'Aproveite para descansar e trocar impressões sobre o passeio.',
    duration: 7,
  },
  {
    id: 'biblioteca',
    name: 'Biblioteca Zila Mamede',
    category: 'CULTURA & CONHECIMENTO',
    short: 'Milhares de histórias. Um lugar para descobrir.',
    // BCZM na Rua da Biblioteca; referência conferida com a foto georreferenciada.
    coords: [-5.839842, -35.199024],
    image: publicAsset('images/biblioteca.jpg'),
    caption: 'Foto: Marcos Elias de Oliveira Júnior · Wikimedia Commons · CC0',
    imageSource:
      'https://commons.wikimedia.org/wiki/File:Biblioteca_Central_Zila_Mamede_(BCZM),_UFRN,_Natal_(RN).jpg',
    description:
      'A Biblioteca Central Zila Mamede nasceu em 1959 como Serviço Central de Biblioteca. Hoje, é uma referência de conhecimento e memória na universidade.',
    tip: 'Antes de entrar, consulte os horários e as regras de visitação.',
    duration: 10,
  },
  {
    id: 'ect',
    name: 'Escola de Ciências e Tecnologia',
    tag: 'ECT',
    category: 'CIÊNCIA & INOVAÇÃO',
    short: 'Onde novas ideias ganham forma.',
    coords: [-5.8436, -35.1995],
    image: publicAsset('images/ect.jpg'),
    caption: 'Panorâmica da ECT · Anastácia Vaz (EXIF) / Vítor.Souza.26 (Commons)',
    imageSource:
      'https://commons.wikimedia.org/wiki/File:COMCT_T_DESTAQUE_ECT-Panor%C3%A2mica_17dez14_Anastacia-Vaz_1.jpg',
    imageLicense: 'CC BY-SA 4.0',
    imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
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
    image: publicAsset('images/cb.jpg'),
    caption: 'Fachada do Centro de Biociências · CB/UFRN',
    imageSource: 'https://www.cb.ufrn.br/',
    description:
      'O Centro de Biociências conecta o estudo da vida à pesquisa e ao ensino. Biologia, ecologia e biodiversidade fazem parte deste capítulo do passeio pelo campus.',
    tip: 'Observe a vegetação do caminho e faça uma pausa à sombra.',
    duration: 10,
  },
];

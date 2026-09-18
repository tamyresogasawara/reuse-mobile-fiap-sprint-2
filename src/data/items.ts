export type Item = {
  id: string;
  title: string;
  category: string;
  price: number;
  city: string;
  condition: string;
  description: string;
  emoji: string;
  accent: string;
};

export const items: Item[] = [
  {
    id: 'cafeteira',
    title: 'Cafeteira italiana',
    category: 'Casa',
    price: 65,
    city: 'Santos, SP',
    condition: 'Ótimo estado',
    description: 'Cafeteira de alumínio para quatro xícaras. Bem cuidada e pronta para uma nova rotina.',
    emoji: '☕',
    accent: '#DCE8D5',
  },
  {
    id: 'mochila',
    title: 'Mochila urbana',
    category: 'Acessórios',
    price: 90,
    city: 'São Vicente, SP',
    condition: 'Pouco usada',
    description: 'Mochila resistente com divisória acolchoada e bolsos laterais.',
    emoji: '🎒',
    accent: '#E7DED2',
  },
  {
    id: 'livros',
    title: 'Coleção de livros',
    category: 'Livros',
    price: 48,
    city: 'Santos, SP',
    condition: 'Bom estado',
    description: 'Quatro livros de ficção contemporânea vendidos juntos.',
    emoji: '📚',
    accent: '#D8E5EC',
  },
  {
    id: 'vaso',
    title: 'Vaso artesanal',
    category: 'Decoração',
    price: 35,
    city: 'Guarujá, SP',
    condition: 'Como novo',
    description: 'Peça em cerâmica com acabamento fosco, produzida localmente.',
    emoji: '🏺',
    accent: '#EFE1D5',
  },
];

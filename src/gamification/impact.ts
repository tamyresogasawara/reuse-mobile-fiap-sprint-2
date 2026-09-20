export type ImpactInput = { favorites: number; listings: number };
export type ImpactLevel = { name: string; startsAt: number; nextAt: number | null };
export type ImpactBadge = { title: string; description: string; unlocked: boolean };
export type ImpactMission = { title: string; description: string; current: number; target: number; complete: boolean; points: number };

const levels: ImpactLevel[] = [
  { name: 'Semente', startsAt: 0, nextAt: 100 },
  { name: 'Broto', startsAt: 100, nextAt: 250 },
  { name: 'Guardião', startsAt: 250, nextAt: 500 },
  { name: 'Embaixador', startsAt: 500, nextAt: null },
];

export function calculateImpact({ favorites, listings }: ImpactInput) {
  const safeFavorites = Math.max(0, favorites);
  const safeListings = Math.max(0, listings);
  const points = safeFavorites * 10 + safeListings * 100;
  const level = [...levels].reverse().find((candidate) => points >= candidate.startsAt) ?? levels[0];
  const span = level.nextAt === null ? 1 : level.nextAt - level.startsAt;
  const progress = level.nextAt === null ? 1 : Math.min(1, (points - level.startsAt) / span);
  const badges: ImpactBadge[] = [
    { title: 'Olhar consciente', description: 'Salvou o primeiro item para evitar uma compra por impulso.', unlocked: safeFavorites >= 1 },
    { title: 'Item em circulação', description: 'Publicou o primeiro anúncio local com informações reais.', unlocked: safeListings >= 1 },
    { title: 'Curadoria circular', description: 'Selecionou cinco itens que merecem uma nova história.', unlocked: safeFavorites >= 5 },
  ];
  const missions: ImpactMission[] = [
    { title: 'Primeira escolha consciente', description: 'Salve um item que você realmente consideraria reutilizar.', current: Math.min(safeFavorites, 1), target: 1, complete: safeFavorites >= 1, points: 10 },
    { title: 'Compartilhe para circular', description: 'Publique um item parado em casa com foto e descrição honestas.', current: Math.min(safeListings, 1), target: 1, complete: safeListings >= 1, points: 100 },
    { title: 'Curadoria com propósito', description: 'Salve três itens relevantes, sem repetir ações para acumular pontos.', current: Math.min(safeFavorites, 3), target: 3, complete: safeFavorites >= 3, points: 30 },
  ];
  return { points, level, progress, badges, missions };
}

export const impactRules = {
  favorite: 10,
  listing: 100,
  fairness: 'Os pontos refletem apenas favoritos únicos e anúncios persistidos. Remover uma ação remove os pontos; repetir não multiplica a pontuação.',
};

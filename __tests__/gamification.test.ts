import { calculateImpact } from '../src/gamification/impact';

describe('gamificação de impacto sustentável', () => {
  it('começa com progresso vazio e uma próxima ação clara', () => {
    const impact = calculateImpact({ favorites: 0, listings: 0 });

    expect(impact.points).toBe(0);
    expect(impact.level.name).toBe('Semente');
    expect(impact.progress).toBe(0);
    expect(impact.badges.every((badge) => !badge.unlocked)).toBe(true);
    expect(impact.missions[0]).toMatchObject({ title: 'Primeira escolha consciente', current: 0, target: 1 });
  });

  it('calcula pontos, nível, medalhas e missões apenas por ações persistidas', () => {
    const impact = calculateImpact({ favorites: 2, listings: 1 });

    expect(impact.points).toBe(120);
    expect(impact.level.name).toBe('Broto');
    expect(impact.level.nextAt).toBe(250);
    expect(impact.progress).toBeCloseTo(20 / 150);
    expect(impact.badges.filter((badge) => badge.unlocked).map((badge) => badge.title)).toEqual([
      'Olhar consciente',
      'Item em circulação',
    ]);
    expect(impact.missions.find((mission) => mission.title === 'Compartilhe para circular')).toMatchObject({ current: 1, target: 1, complete: true });
  });
});

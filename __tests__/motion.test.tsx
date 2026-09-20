import { act, render, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Text } from 'react-native';
import { useReducedMotion } from '../src/motion/useReducedMotion';

function ReducedMotionProbe() {
  const reducedMotion = useReducedMotion();
  return <Text>{reducedMotion === null ? 'unknown' : String(reducedMotion)}</Text>;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('preferência de movimento reduzido', () => {
  it('usa o estado final seguro quando a consulta do sistema falha', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockRejectedValueOnce(new Error('unavailable'));
    const { getByText } = await render(<ReducedMotionProbe />);

    await waitFor(() => getByText('true'));
  });

  it('acompanha mudanças da preferência em tempo real', async () => {
    let listener: ((enabled: boolean) => void) | undefined;
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValueOnce(false);
    jest.spyOn(AccessibilityInfo, 'addEventListener').mockImplementation(((event: string, callback: (enabled: boolean) => void) => {
      if (event === 'reduceMotionChanged') listener = callback;
      return { remove: jest.fn() };
    }) as never);
    const { getByText } = await render(<ReducedMotionProbe />);
    await waitFor(() => getByText('false'));

    await act(async () => listener?.(true));

    await waitFor(() => getByText('true'));
  });
});

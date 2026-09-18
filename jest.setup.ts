(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///reuse-camera.jpg' }] })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///reuse-library.jpg' }] })),
}));

jest.mock('expo-file-system', () => {
  const copy = jest.fn(async () => undefined);
  const File = jest.fn(function MockFile(this: { uri: string; copy: typeof copy }, ...parts: Array<string | { uri: string }>) {
    const uris = parts.map((part) => typeof part === 'string' ? part : part.uri);
    this.uri = uris.length === 1 ? uris[0] : `${uris[0].replace(/\/$/, '')}/${uris.slice(1).join('/')}`;
    this.copy = copy;
  });
  return { File, Paths: { document: { uri: 'file:///documents' } } };
});

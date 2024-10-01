// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function previewAnnotations(entry: any[] = [], _: any = {}): StorybookConfig['previewAnnotations'] {
  // @ts-ignore
  return [require.resolve(`./config`), ...entry];
}

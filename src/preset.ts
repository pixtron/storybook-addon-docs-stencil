// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function config(entry: any[] = [], _: any = {}): any[] {
  // @ts-ignore
  return [require.resolve(`./config`), ...entry];
}

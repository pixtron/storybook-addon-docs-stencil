import { PresetProperty } from '@storybook/types';

export const previewAnnotations: PresetProperty<'previewAnnotations'> = async (
  entries: string[] = [],
) => {
  return [...entries, require.resolve(`./config`)];
};

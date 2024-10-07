import { join } from 'node:path';

import { PresetProperty } from '@storybook/types';

export const previewAnnotations: PresetProperty<'previewAnnotations'> = async (
  entries: string[] = [],
) => {
  return [...entries, join(__dirname, 'entry-preview-docs.js')];
};

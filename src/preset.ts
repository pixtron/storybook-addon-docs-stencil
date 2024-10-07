import { join } from 'node:path';

import { Options, PresetProperty } from '@storybook/types';

export const previewAnnotations: PresetProperty<'previewAnnotations'> = async (
  entries: string[] = [],
  options: Options,
) => {
  const docsEnabled =
    Object.keys(await options.presets.apply('docs', {}, options)).length > 0;
  const result: string[] = [];

  return result
    .concat(entries)
    .concat(docsEnabled ? [join(__dirname, 'entry-preview-docs.js')] : []);
};

# storybook-addon-docs-stencil

Converts stencil.js doc json derived from stencils output target
[`docs-json`](https://stenciljs.com/docs/docs-json) to storybook
[`ArgTypes`](https://storybook.js.org/docs/react/api/argtypes).

With this addon activated

- Storybook will render basic controls for properties [Controls](https://storybook.js.org/docs/react/essentials/controls).
- Storybook will auto generate documentation for Props, Events, Methods, Slots, Shadow Parts and Custom Properties.
- Storybook doc page will contain stencils component documentation (readme.md or inline)

## Installation

```bash
npm i -D @pxtrn/storybook-addon-docs-stencil
```

## Usage

### Configure stencil to generate docs-json at build time.

```js
// stencil.config.ts

import { Config } from '@stencil/core';

export const config: Config = {
  outputTargets: [
    {
      type: 'docs-json',
      file: 'path/to/docs.json'
    }
  ]
};
```

### Configure Storybook

```js
//.storybook/main.js

module.exports = {
  addons: [
    '@storybook/addon-essentials',
    '@pxtrn/storybook-addon-docs-stencil',
  ],
};
```

```js
//.storybook/preview.js

import { setStencilDocJson } from '@pxtrn/storybook-addon-docs-stencil';
import docJson from 'path/to/docs.json';
if (docJson) setStencilDocJson(docJson);

export const parameters = {
  controls: { hideNoControlsWarning: true },
};
```

### Configure the argTypes extractor

```js
//.storybook/preview.js

import { extractArgTypesFactory } from '@pxtrn/storybook-addon-docs-stencil';

/** @type { import('@pxtrn/storybook-addon-docs-stencil').ExtractArgTypesOptions } */
const options = {
  excludeCategories: 'porperties',
  controlsFor: 'attributes',
  eventNameing: 'jsx',
};

export const parameters = {
  docs: {
    extractArgTypes: extractArgTypesFactory(options),
  },
};
```

#### ExtractArgTypesOptions

- `excludeCategories: Category[]`: categories to exclude from argTypes and docs (default: `['attributes]`).
- `controlsFor: 'attributes' | 'properties'`: for wich category to render controls.
- `eventNameing: 'native' | 'jsx'`: nameing of the arg key for events (default: 'native'). If jsx the args can be spread `<my-component {...args} />` when using JSX to render stories.

### Default render method

When using @storybook/web-components or @storybook/html as renderer args and actions do not get bound automatically. This addon includes an optional default renderer that works out of the box

```js
//.storybook/preview.js

import {
  extractArgTypesFactory,
  stencilRender,
} from '@pxtrn/storybook-addon-docs-stencil';

/** @type { import('@storybook/web-components').Preview } */
const preview = {
  render: stencilRender(),
};

export default preview;
```

`stencilRender` can be configured by these options:

- `eventNameing: 'native' | 'jsx'`: use the same nameing used in ExtractArgTypesOptions (default: 'native)
- `bindEvents: boolean`: wheter events/actions should be bound (default: true)

eg:

```js
stencilRender({ bindEvents: false });
```

### Component documentation

#### readme.md

If not already created by stencil create `src/components/my-component/readme.md`
If the line `<!-- Auto Generated Below -->` is not present, stencil will ignore this file.

```md
Everything above this line will be included in storybook

<!-- Auto Generated Below -->
```

#### inline documentation

```ts
// src/components/my-component/my-component.tsx`

/**
 * Everything written here will be included, if readme.md is not present.
 */
@Component({
  tag: 'my-component',
  styleUrl: 'my-component.css',
  shadow: true,
})
```

If you prefere the inline documentation over the readme, see [issue #15](https://github.com/pixtron/storybook-addon-docs-stencil/issues/15#issuecomment-2387147999).

#### Troubleshooting

##### Hint your component in your stories

```ts
// your-story.ts

export default {
  title: 'My Component',
  component: 'my-component',
};
```

### Breaking Changes in v7

- attributes and properties are now shown as own categories, before both where visible under "props" with some inconsitency in naming (dashCase vs camelCase). Use `excludeCategories` to configure which categories are shown.
- removed configuration `dashCase` properties and attributes are now shown in single sections. Use `controlsFor` and `excludeCategories` instead of `dashCase`.

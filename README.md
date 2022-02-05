# storybook-addon-docs-stencil

Converts stencil.js doc json derived from stencils output target
[`docs-json`](https://stenciljs.com/docs/docs-json) to storybook
[`ArgTypes`](https://storybook.js.org/docs/react/api/argtypes).

With this addon activated
- Storybook will render basic controls for properties [Controls](https://storybook.js.org/docs/react/essentials/controls).
- Storybook will auto generate documentation for Props, Events, Methods, Slots, Shadow Parts and Custom Properties.
- Storybook doc page will contain stencils component documentation (readme.md or inline)   

## Installation

```
npm i -D @pxtrn/storybook-addon-docs-stencil
```

## Usage

### Configure stencil to generate docs-json at build time.

```
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

```
//.storybook/main.js

module.exports = {
  addons: [
    '@storybook/addon-essentials',
    '@pxtrn/storybook-addon-docs-stencil'
  ]
}
```

```
//.storybook/preview.js

import { setStencilDocJson } from '@pxtrn/storybook-addon-docs-stencil';
import docJson from 'path/to/docs.json';
if(docJson) setStencilDocJson(docJson);

export const parameters = {
  controls: { hideNoControlsWarning: true }
}
```

#### Dash cased properties

```
//.storybook/preview.js

import { extractArgTypesFactory } from '@pxtrn/storybook-addon-docs-stencil';

export const parameters = {
  docs: {
    extractArgTypes: extractArgTypesFactory({ dashCase: true }),
  }
}
```

### Component documentation

#### readme.md

If not already created by stencil create `src/components/my-component/readme.md`
If the line `<!-- Auto Generated Below -->` is not present, stencil will ignore this file.

```
Everything above this line will be included in storybook

<!-- Auto Generated Below -->
```

#### inline documentation

```
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

#### Troubleshooting

##### When using @storybook/web-components

`@storybook/web-components` overrides the preset configuration of this module.
You can fix this with this preview config.

```
//.storybook/preview.js

import { extractArgTypes, extractComponentDescription, setStencilDocJson } from '@pxtrn/storybook-addon-docs-stencil';

export const parameters = {
  ...
  docs: {
    extractArgTypes,
    extractComponentDescription,
  },
};
```

##### Hint your component in your stories
```
// your-story.ts

export default {
  title: 'My Component',
  component: 'my-component',
};
```

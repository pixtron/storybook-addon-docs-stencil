import { ArgTypes } from '@storybook/api';
import { logger } from '@storybook/client-logger';

import {
  ExtractArgTypesOptions,
  StencilJsonDocs,
  StencilJsonDocsProp,
  StencilJsonDocsMethod,
  StencilJsonDocsEvent,
  StencilJsonDocsStyle,
  StencilJsonDocsSlot,
  StencilJsonDocsPart,
  StencilJsonDocsComponent,
} from './types';

const isValidComponent = (tagName: string) => {
  if (!tagName) {
    return false;
  }
  if (typeof tagName === 'string') {
    return true;
  }
  throw new Error('Provided component needs to be a string. e.g. component: "my-element"');
}

const isValidMetaData = (stencilDocJson: StencilJsonDocs) => {
  if (!stencilDocJson) {
    return false;
  }
  if (stencilDocJson.components && Array.isArray(stencilDocJson.components)) {
    return true;
  }
  throw new Error(`You need to setup valid meta data in your preview.js via setStencilDocJson().
    The meta data can be generated with the stencil output target 'docs-json'.`);
}

const getMetaData = (tagName: string, stencilDocJson: StencilJsonDocs) => {
  if (!isValidComponent(tagName) || !isValidMetaData(stencilDocJson)) {
    return null;
  }

  const metaData = stencilDocJson.components.find(
    (component) => component.tag.toUpperCase() === tagName.toUpperCase()
  );
  if (!metaData) {
    logger.warn(`Component not found in stencil doc json: ${tagName}`);
  }
  return metaData;
};

const mapItemValuesToOptions = (item: StencilJsonDocsProp) => {
  return item.values
    .filter(value => ['string', 'number'].includes(value.type))
    .map(value => value.value);
}

const mapPropTypeToControl = (item: StencilJsonDocsProp): { control: {type: string}, options: (string | number)[] | null } => {
  let control;
  let options: (string | number)[] | null = null;

  switch(item.type) {
    case 'string':
      control = { type: 'text' };
    break;
    case 'number':
      control = { type: 'number' }
    break;
    case 'boolean':
      control = { type: 'boolean' }
    break;
    case 'function':
    case 'void':
      control = null;
    break;
    default:
      options = mapItemValuesToOptions(item);

      if(options.length === 0) {
        control = { type: 'object' };
      } else if(options.length < 5) {
        control = { type: 'radio' };
      } else {
        control = { type: 'select' };
      }
  }

  return { control, options };
}

const mapPropsData = (data: StencilJsonDocsProp[], options: ExtractArgTypesOptions): ArgTypes => {
  const { dashCase } = options;

  return (
    data &&
    data.reduce((acc, item) => {
      const { control, options } = mapPropTypeToControl(item);
      const key = dashCase === true ? (item.attr || item.name) : item.name;

      acc[key] = {
        name: item.attr || item.name,
        description: item.docs,
        type: { required: item.required },
        control: control,
        table: {
          category: 'props',
          type: { summary: item.type },
          defaultValue: { summary: item.default },
        },
      };

      if (options !== null) acc[key].options = options;

      return acc;
    }, {} as ArgTypes)
  );
}

const mapEventsData = (data: StencilJsonDocsEvent[]): ArgTypes => {
  return (
    data &&
    data.reduce((acc, item) => {
      acc[`event-${item.event}`] = {
        name: item.event,
        description: item.docs,
        type: { name: 'void' },
        control: null,
        table: {
          category: 'events',
          type: { summary: item.detail }
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
}

const mapMethodsData = (data: StencilJsonDocsMethod[]): ArgTypes => {
  return (
    data &&
    data.reduce((acc, item) => {
      acc[`method-${item.name}`] = {
        name: item.name,
        description: item.docs,
        type: { name: 'void' },
        control: null,
        table: {
          category: 'methods',
          type: { summary: item.signature }
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
}

const mapGenericData = <T extends {name: string, docs: string}>(data: T[], category: string): ArgTypes => {
  return (
    data &&
    data.reduce((acc, item) => {
      const type = { name: 'void' };
      acc[`${category.replace(/\s/g, '-').toLowerCase()}-${item.name}`] = {
        name: item.name,
        required: false,
        description: item.docs,
        control: null,
        type,
        table: {
          category,
          type,
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
}


/**
 * @param stencilDocJson stencil json doc
 */
export const setStencilDocJson = (stencilDocJson: StencilJsonDocs): void => {
  // @ts-ignore
  window.__STORYBOOK_STENCIL_DOC_JSON__ = stencilDocJson;
};

// @ts-ignore
export const getStencilDocJson = ():StencilJsonDocs => window.__STORYBOOK_STENCIL_DOC_JSON__;

/**
 * @param {string} tagName - stencil component for which to extract ArgTypes
 * @param {StencilJsonDocs} stencilDocJson - Stencil meta data from `docs-json` output target
 */
export const extractArgTypesFromElements = (
  tagName: string,
  options: ExtractArgTypesOptions
): ArgTypes => {
  const metaData = getComponentMetaData(tagName);

  return (
    metaData && {
      ...mapPropsData(metaData.props, options),
      ...mapEventsData(metaData.events),
      ...mapMethodsData(metaData.methods),
      ...mapGenericData<StencilJsonDocsSlot>(metaData.slots, 'slots'),
      ...mapGenericData<StencilJsonDocsStyle>(metaData.styles, 'css custom properties'),
      ...mapGenericData<StencilJsonDocsPart>(metaData.parts, 'css shadow parts'),
    }
  );
};

/**
 * @param {Partial<ExtractArgTypesOptions>} options - options for extractArgTypes
 */
export const extractArgTypesFactory = (
  options: Partial<ExtractArgTypesOptions> = {}
): (tagName: string) => ArgTypes => {
  return (tagName: string): ArgTypes => {
    return extractArgTypesFromElements(tagName, {
      dashCase: false,
      ...options
    });
  }
};

/**
 * @param {string} tagName - stencil component for which to extract ArgTypes
 */
export const extractArgTypes = extractArgTypesFactory();


/**
 * @param {string} tagName - stencil component for which to extract description
 */
export const extractComponentDescription = (tagName: string): string => {
  const metaData = getComponentMetaData(tagName);
  return metaData && (metaData.readme || metaData.docs);
};

/**
 *
 * @param {string} tagName - stencil component for which to get the metaData
 */
export const getComponentMetaData = (tagName: string): StencilJsonDocsComponent | null => {
  return getMetaData(tagName, getStencilDocJson());
}
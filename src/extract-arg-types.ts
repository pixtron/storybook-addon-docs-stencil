import { ArgTypes, InputType, SBType } from '@storybook/types';
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
  GenericCategory,
  Category,
} from './types';

const isValidComponent = (tagName: string) => {
  if (!tagName) {
    return false;
  }
  if (typeof tagName === 'string') {
    return true;
  }
  throw new Error(
    'Provided component needs to be a string. e.g. component: "my-element"',
  );
};

const isValidMetaData = (stencilDocJson: StencilJsonDocs) => {
  if (!stencilDocJson) {
    return false;
  }
  if (stencilDocJson.components && Array.isArray(stencilDocJson.components)) {
    return true;
  }
  throw new Error(`You need to setup valid meta data in your preview.js via setStencilDocJson().
    The meta data can be generated with the stencil output target 'docs-json'.`);
};

const getMetaData = (tagName: string, stencilDocJson: StencilJsonDocs) => {
  if (!isValidComponent(tagName) || !isValidMetaData(stencilDocJson)) {
    return null;
  }

  const metaData = stencilDocJson.components.find(
    component => component.tag.toUpperCase() === tagName.toUpperCase(),
  );
  if (!metaData) {
    logger.warn(`Component not found in stencil doc json: ${tagName}`);
  }
  return metaData;
};

const mapPropType = (item: StencilJsonDocsProp): SBType => {
  const { type, required } = item;

  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
      return { name: type, required };
    default:
      if (item.values.length === 1) {
        // TODO - in this case type be improved eg. "object" | "function" | "array" ...
        return { name: 'other', value: type, required };
      }

      if (isEnum(item)) {
        return {
          name: 'enum',
          required,
          value: item.values.map(({ value }) => value),
        };
      }

      return { name: 'union', value: mapItemValuesToSbType(item), required };
  }
};

const isEnum = (item: StencilJsonDocsProp): boolean => {
  return (
    item.values.length > 1 &&
    item.values.findIndex(
      ({ type }) => !['string', 'number'].includes(type),
    ) === -1
  );
};

const mapItemValuesToSbType = (item: StencilJsonDocsProp): SBType[] => {
  return item.values.map(({ type, value }): SBType => {
    switch (type) {
      case 'string':
      case 'number':
      case 'boolean':
        return { name: type };
      default:
        return { name: 'other', value };
    }
  });
};

const mapPropItem = (
  item: StencilJsonDocsProp,
  name: string,
  category: 'attributes' | 'properties',
  hasControl: boolean,
): InputType => {
  const inputType: InputType = {
    name: name,
    description: item.docs,
    required: item.required,
    isAttribute: category === 'attributes',
    table: {
      category,
      type: { summary: item.type },
      defaultValue: { summary: item.default },
    },
  };

  if (hasControl) {
    const type = mapPropType(item);
    inputType.type = type;

    if (type.name === 'enum' && type.value.length > 2) {
      inputType.options = type.value;
      inputType.control = { type: 'select' };
    }
  } else {
    inputType.control = {
      disabled: true,
    };
  }

  return inputType;
};

const mapPropsData = (
  data: StencilJsonDocsProp[],
  options: ExtractArgTypesOptions,
): ArgTypes => {
  const excludeAttributes = excludeCategory('attributes', options);
  const excludeProperties = excludeCategory('properties', options);

  if (excludeAttributes && excludeProperties) return {};

  const { controlsFor } = options;

  return (
    data &&
    data.reduce((acc, item) => {
      if (!excludeAttributes && item.attr) {
        const hasControl = controlsFor === 'attributes';
        const name = item.attr;
        const key = hasControl ? name : `attribute-${name}`;

        acc[key] = mapPropItem(item, name, 'attributes', hasControl);
      }

      if (!excludeProperties) {
        const hasControl = controlsFor === 'properties';
        const name = item.name;
        const key = hasControl ? name : `property-${name}`;

        acc[key] = mapPropItem(item, name, 'properties', hasControl);
      }

      return acc;
    }, {} as ArgTypes)
  );
};

const mapEventsData = (
  data: StencilJsonDocsEvent[],
  options: ExtractArgTypesOptions,
): ArgTypes => {
  const category = 'events';
  if (excludeCategory(category, options)) return {};

  return (
    data &&
    data.reduce((acc, item) => {
      acc[item.event] = {
        name: item.event,
        action: item.event,
        description: item.docs,
        control: {
          disabled: true,
        },
        table: {
          category,
          type: { summary: `CustomEvent<${item.detail}>` },
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
};

const mapMethodsData = (
  data: StencilJsonDocsMethod[],
  options: ExtractArgTypesOptions,
): ArgTypes => {
  const category = 'methods';
  if (excludeCategory(category, options)) return {};

  return (
    data &&
    data.reduce((acc, item) => {
      acc[item.name] = {
        name: item.name,
        description: item.docs,
        control: {
          disabled: true,
        },
        table: {
          category,
          type: { summary: item.signature },
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
};

const mapGenericData = <T extends { name: string; docs: string }>(
  data: T[],
  category: GenericCategory,
  options: ExtractArgTypesOptions,
): ArgTypes => {
  if (excludeCategory(category, options)) return {};

  return (
    data &&
    data.reduce((acc, item) => {
      const type = { name: 'void' };
      acc[`${category.replace(/\s/g, '-').toLowerCase()}-${item.name}`] = {
        name: item.name,
        required: false,
        description: item.docs,
        control: {
          disabled: true,
        },
        table: {
          category,
          type,
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
};

const excludeCategory = (
  category: Category,
  options: ExtractArgTypesOptions,
) => {
  return (
    Array.isArray(options.excludeCategories) &&
    options.excludeCategories.includes(category)
  );
};

/**
 * @param stencilDocJson stencil json doc
 */
export const setStencilDocJson = (stencilDocJson: StencilJsonDocs): void => {
  // @ts-ignore
  window.__STORYBOOK_STENCIL_DOC_JSON__ = stencilDocJson;
};

export const getStencilDocJson = (): StencilJsonDocs => {
  // @ts-ignore
  return window.__STORYBOOK_STENCIL_DOC_JSON__;
};

/**
 * @param {string} tagName - stencil component for which to extract ArgTypes
 * @param {StencilJsonDocs} stencilDocJson - Stencil meta data from `docs-json` output target
 */
export const extractArgTypesFromElements = (
  tagName: string,
  options: ExtractArgTypesOptions,
): ArgTypes => {
  const metaData = getComponentMetaData(tagName);

  return (
    metaData && {
      ...mapPropsData(metaData.props, options),
      ...mapEventsData(metaData.events, options),
      ...mapMethodsData(metaData.methods, options),
      ...mapGenericData<StencilJsonDocsSlot>(metaData.slots, 'slots', options),
      ...mapGenericData<StencilJsonDocsStyle>(
        metaData.styles,
        'css custom properties',
        options,
      ),
      ...mapGenericData<StencilJsonDocsPart>(
        metaData.parts,
        'css shadow parts',
        options,
      ),
    }
  );
};

/**
 * @param {Partial<ExtractArgTypesOptions>} options - options for extractArgTypes
 */
export const extractArgTypesFactory = (
  options: Partial<ExtractArgTypesOptions> = {},
): ((tagName: string) => ArgTypes) => {
  const opts: ExtractArgTypesOptions = {
    excludeCategories: ['attributes'],
    controlsFor: 'properties',
    ...options,
  };

  if (
    Array.isArray(opts.excludeCategories) &&
    opts.excludeCategories.includes(opts.controlsFor)
  ) {
    logger.warn(
      `Category "${opts.controlsFor}" configured for conrols in options.controlsFor is excluded by options.excludeCategories`,
    );
  }

  return (tagName: string): ArgTypes => {
    return extractArgTypesFromElements(tagName, opts);
  };
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
export const getComponentMetaData = (
  tagName: string,
): StencilJsonDocsComponent | null => {
  return getMetaData(tagName, getStencilDocJson());
};

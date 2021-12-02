import { ArgTypes } from "@storybook/api";
import { logger } from "@storybook/client-logger";

import {
  StencilJsonDocs,
  StencilJsonDocsProp,
  StencilJsonDocsMethod,
  StencilJsonDocsEvent,
  StencilJsonDocsStyle,
  StencilJsonDocsSlot,
  StencilJsonDocsPart,
} from "./types";

const isValidComponent = (tagName: string) => {
  if (!tagName) {
    return false;
  }
  if (typeof tagName === "string") {
    return true;
  }
  throw new Error(
    'Provided component needs to be a string. e.g. component: "my-element"'
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
    (component) => component.tag.toUpperCase() === tagName.toUpperCase()
  );
  if (!metaData) {
    logger.warn(`Component not found in stencil doc json: ${tagName}`);
  }
  return metaData;
};

const mapItemOptions = function (item: StencilJsonDocsProp) {
  return item.values
    .filter(function (value) {
      return ["string", "number"].includes(value.type);
    })
    .map(function (value) {
      return value.value;
    });
};

const mapPropTypeToControl = (
  item: StencilJsonDocsProp
): { type: string; options?: (string | number)[] } => {
  let controlType;
  let values = [];

  switch (item.type) {
    case "string":
    case "string | undefined":
    case "Date | string":
    case "Date":
      controlType = { type: "text" };
      break;
    case "number":
    case "number | undefined":
      controlType = { type: "number" };
      break;
    case "boolean":
    case "boolean | undefined":
      controlType = { type: "boolean" };
      break;
    case "function":
    case "function | undefined":
    case "void":
    case "void | undefined":
      controlType = null;
      break;
    default:
      values = mapItemOptions(item);

      if (values.length === 0) {
        controlType = { type: "object" };
      } else if (values.length < 5) {
        controlType = { type: "radio" };
      } else {
        controlType = { type: "select" };
      }

      values;
  }

  return controlType;
};

const mapPropsData = (data: StencilJsonDocsProp[]): ArgTypes => {
  return (
    data &&
    data.reduce((acc, item) => {
      acc[`prop-${item.name}`] = {
        name: item.attr ? item.attr : item.name,
        description: item.docs,
        type: { name: item.type, required: item.required },
        control: mapPropTypeToControl(item),
        table: {
          category: "props",
          type: { summary: item.type },
          defaultValue: { summary: item.default },
        },
        options: mapItemOptions(item).length ? mapItemOptions(item) : [],
      };
      return acc;
    }, {} as ArgTypes)
  );
};

const mapEventsData = (data: StencilJsonDocsEvent[]): ArgTypes => {
  return (
    data &&
    data.reduce((acc, item) => {
      acc[`event-${item.event}`] = {
        name: item.event,
        description: item.docs,
        type: { name: "void" },
        control: null,
        table: {
          category: "events",
          type: { summary: item.detail },
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
};

const mapMethodsData = (data: StencilJsonDocsMethod[]): ArgTypes => {
  return (
    data &&
    data.reduce((acc, item) => {
      acc[`method-${item.name}`] = {
        name: item.name,
        description: item.docs,
        type: { name: "void" },
        control: null,
        table: {
          category: "methods",
          type: { summary: item.signature },
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
};

const mapGenericData = <T extends { name: string; docs: string }>(
  data: T[],
  category: string
): ArgTypes => {
  return (
    data &&
    data.reduce((acc, item) => {
      const type = { name: "void" };
      acc[`${category}-${item.name}`] = {
        name: item.name,
        required: false,
        description: item.docs,
        control: false,
        type,
        table: {
          category,
          type,
        },
      };
      return acc;
    }, {} as ArgTypes)
  );
};

/**
 * @param stencilDocJson stencil json doc
 */
export const setStencilDocJson = (stencilDocJson: StencilJsonDocs): void => {
  // @ts-ignore
  window.__STORYBOOK_STENCIL_DOC_JSON__ = stencilDocJson;
};

export const getStencilDocJson = (): StencilJsonDocs =>
  // @ts-ignore
  window.__STORYBOOK_STENCIL_DOC_JSON__;

/**
 * @param {string} tagName - stencil component for which to extract ArgTypes
 * @param {StencilJsonDocs} stencilDocJson - Stencil meta data from `docs-json` output target
 */
export const extractArgTypesFromElements = (
  tagName: string,
  stencilDocJson: StencilJsonDocs
): ArgTypes => {
  const metaData = getMetaData(tagName, stencilDocJson);

  return (
    metaData && {
      ...mapPropsData(metaData.props),
      ...mapEventsData(metaData.events),
      ...mapMethodsData(metaData.methods),
      ...mapGenericData<StencilJsonDocsSlot>(metaData.slots, "slots"),
      ...mapGenericData<StencilJsonDocsStyle>(
        metaData.styles,
        "css custom properties"
      ),
      ...mapGenericData<StencilJsonDocsPart>(
        metaData.parts,
        "css shadow parts"
      ),
    }
  );
};

/**
 * @param {string} tagName - stencil component for which to extract ArgTypes
 */
export const extractArgTypes = (tagName: string): ArgTypes => {
  return extractArgTypesFromElements(tagName, getStencilDocJson());
};

/**
 * @param {string} tagName - stencil component for which to extract description
 */
export const extractComponentDescription = (tagName: string): string => {
  const metaData = getMetaData(tagName, getStencilDocJson());
  return metaData && (metaData.readme || metaData.docs);
};

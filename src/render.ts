import type { ArgsStoryFn } from '@storybook/types';
import { useEffect } from '@storybook/preview-api';

type Handlers = [string, EventListenerOrEventListenerObject][];
const addEventListeners = (element: Element, handlers: Handlers) => {
  useEffect(() => {
    handlers.forEach(([name, handler]) =>
      element.addEventListener(name, handler),
    );
    return () =>
      handlers.forEach(([name, handler]) =>
        element.removeEventListener(name, handler),
      );
  });
};

// Default render method
export const stencilRender = (): ArgsStoryFn => {
  return (args, context) => {
    const { id, component, argTypes } = context;

    if (!component) {
      throw new Error(
        `Unable to render story ${id} as the component annotation is missing from the default export`,
      );
    }

    if (typeof component !== 'string') {
      throw new Error(
        `Unable to render story ${id} as the component is not a string (eg: component: 'my-component')`,
      );
    }

    const element = document.createElement(component);
    const handlers: Handlers = [];

    Object.entries(args).forEach(([key, arg]) => {
      const argType = argTypes[key];

      if (arg.isAction) {
        handlers.push([key, arg]);
      } else if (argType && argType.isAttribute) {
        element.setAttribute(key, arg);
      } else {
        // @ts-ignore
        element[key] = arg;
      }
    });

    if (handlers.length > 0) addEventListeners(element, handlers);

    return element;
  };
};

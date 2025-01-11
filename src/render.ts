import type { ArgsStoryFn } from '@storybook/types';
import { useEffect } from '@storybook/preview-api';
import { RenderOptions } from './types';

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
export const stencilRender = (
  options: Partial<RenderOptions> = {},
): ArgsStoryFn => {
  const opts: RenderOptions = {
    eventNameing: 'native',
    bindEvents: true,
    ...options,
  };

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
        const eventName =
          opts.eventNameing === 'jsx'
            ? `${key.charAt(2).toLowerCase()}${key.slice(3)}`
            : key;
        handlers.push([eventName, arg]);
      } else if (argType && argType.isAttribute) {
        element.setAttribute(key, arg);
      } else {
        // @ts-ignore
        element[key] = arg;
      }
    });

    if (opts.bindEvents && handlers.length > 0) {
      addEventListeners(element, handlers);
    }

    return element;
  };
};

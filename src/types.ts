export interface StencilJsonDocs {
  components: StencilJsonDocsComponent[];
  timestamp: string;
  compiler: {
    name: string;
    version: string;
    typescriptVersion: string;
  };
}

export interface StencilJsonDocsComponent {
  dirPath?: string;
  fileName?: string;
  filePath?: string;
  readmePath?: string;
  usagesDir?: string;
  encapsulation: 'shadow' | 'scoped' | 'none';
  tag: string;
  readme: string;
  docs: string;
  docsTags: StencilJsonDocsTag[];
  usage: StencilJsonDocsUsage;
  props: StencilJsonDocsProp[];
  methods: StencilJsonDocsMethod[];
  events: StencilJsonDocsEvent[];
  listeners: StencilJsonDocsListener[];
  styles: StencilJsonDocsStyle[];
  slots: StencilJsonDocsSlot[];
  parts: StencilJsonDocsPart[];
  dependents: string[];
  dependencies: string[];
  dependencyGraph: StencilJsonDocsDependencyGraph;
  deprecation?: string;
}

export interface StencilJsonDocsDependencyGraph {
  [tagName: string]: string[];
}

export interface StencilJsonDocsTag {
  name: string;
  text?: string;
}

export interface StencilJsonDocsValue {
  value?: string;
  type: string;
}

export interface StencilJsonDocsUsage {
  [key: string]: string;
}

export interface StencilJsonDocsProp {
  name: string;
  type: string;
  mutable: boolean;
  attr?: string;
  reflectToAttr: boolean;
  docs: string;
  docsTags: StencilJsonDocsTag[];
  default: string;
  deprecation?: string;
  values: StencilJsonDocsValue[];
  optional: boolean;
  required: boolean;
}

export interface StencilJsonDocsMethod {
  name: string;
  docs: string;
  docsTags: StencilJsonDocsTag[];
  deprecation?: string;
  signature: string;
  returns: StencilJsonDocsMethodReturn;
  parameters: JsonDocMethodParameter[];
}

export interface StencilJsonDocsMethodReturn {
  type: string;
  docs: string;
}

export interface JsonDocMethodParameter {
  name: string;
  type: string;
  docs: string;
}

export interface StencilJsonDocsEvent {
  event: string;
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
  docs: string;
  docsTags: StencilJsonDocsTag[];
  deprecation?: string;
  detail: string;
}

export interface StencilJsonDocsStyle {
  name: string;
  docs: string;
  annotation: string;
}

export interface StencilJsonDocsListener {
  event: string;
  target?: string;
  capture: boolean;
  passive: boolean;
}

export interface StencilJsonDocsSlot {
  name: string;
  docs: string;
}

export interface StencilJsonDocsPart {
  name: string;
  docs: string;
}

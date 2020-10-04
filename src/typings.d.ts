declare module '*.yaml' {
  const content: any;
  export default content;
}

declare module '*.yml' {
  const content: any;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module 'text-to-svg' {
  export type AnchorAlign = 'left' | 'center' | 'right';
  export type AnchorBaseline = 'baseline' | 'top' | 'middle' | 'bottom';

  export interface GetDOptions {
    x?: number;
    y?: number;
    fontSize?: number;
    kerning?: boolean;
    letterSpacing?: number;
    tracking?: number;
    anchor?: `${AnchorAlign} ${AnchorBaseline}`;
  }

  export interface GetPathOptions extends GetDOptions {
    attributes?: Record<string, unknown>;
  }

  export type GetSVGOptions = GetPathOptions;

  export type GetMetricsOptions = GetDOptions;

  export interface Metrics {
    x: number;
    y: number;
    baseline: number;
    width: number;
    height: number;
    ascender: number;
    descender: number;
  }

  export default class TextToSVG {
    static loadSync(fontUrl?: string): TextToSVG;

    getD(text: string, options?: GetDOptions): string;
    getPath(text: string, options?: GetPathOptions): string;
    getSVG(text: string, options?: GetSVGOptions): string;
    getMetrics(text: string, options?: GetMetricsOptions): Metrics;
  }
}

/**
 * W3C Web Annotation Selector Types
 * Based on https://www.w3.org/TR/annotation-model/#selectors
 */

export interface TextQuoteSelector {
  type: 'TextQuoteSelector';
  exact: string;
  prefix?: string;
  suffix?: string;
}

export interface TextPositionSelector {
  type: 'TextPositionSelector';
  start: number;
  end: number;
}

export interface FragmentSelector {
  type: 'FragmentSelector';
  conformsTo: string;
  value: string;
}

export interface CssSelector {
  type: 'CssSelector';
  value: string;
}

export interface XPathSelector {
  type: 'XPathSelector';
  value: string;
}

export interface RangeSelector {
  type: 'RangeSelector';
  startSelector: Selector;
  endSelector: Selector;
}

export type Selector =
  | TextQuoteSelector
  | TextPositionSelector
  | FragmentSelector
  | CssSelector
  | XPathSelector
  | RangeSelector;

export type SelectorType = Selector['type'];

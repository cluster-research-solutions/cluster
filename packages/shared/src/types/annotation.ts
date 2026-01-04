/**
 * W3C Web Annotation Data Model Types
 * Based on https://www.w3.org/TR/annotation-model/
 */

import type { Selector } from './selector.js';

export type AnnotationMotivation =
  | 'highlighting'
  | 'tagging'
  | 'classifying'
  | 'commenting'
  | 'describing'
  | 'linking'
  | 'questioning'
  | 'bookmarking';

export interface Agent {
  id: string;
  type: 'Person' | 'Organization' | 'Software';
  name?: string;
  nickname?: string;
  email?: string;
}

export interface TextualBody {
  type: 'TextualBody';
  value: string;
  format?: string;
  language?: string;
  purpose?: 'tagging' | 'describing' | 'commenting' | 'replying';
}

export interface SpecificResource {
  type: 'SpecificResource';
  source: string;
  purpose?: 'tagging' | 'classifying' | 'identifying' | 'describing';
  selector?: Selector;
}

export type AnnotationBody = TextualBody | SpecificResource | string;

export interface AnnotationTarget {
  source: string;
  selector?: Selector | Selector[];
}

export interface Annotation {
  '@context': string | string[];
  id: string;
  type: 'Annotation' | string[];
  motivation: AnnotationMotivation | AnnotationMotivation[];
  creator?: Agent;
  created?: string;
  modified?: string;
  body?: AnnotationBody | AnnotationBody[];
  target: AnnotationTarget | AnnotationTarget[] | string;
  [key: string]: unknown; // Allow custom properties
}

export interface AnnotationCollection {
  '@context': string | string[];
  id: string;
  type: 'AnnotationCollection';
  label?: string;
  total?: number;
  first?: AnnotationPage | string;
  last?: AnnotationPage | string;
}

export interface AnnotationPage {
  '@context': string | string[];
  id: string;
  type: 'AnnotationPage';
  partOf?: string;
  next?: string;
  prev?: string;
  startIndex?: number;
  items: Annotation[];
}

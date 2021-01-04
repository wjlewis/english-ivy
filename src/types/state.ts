import { Id } from './misc';
import { Node } from './node';
import { ProductionName } from './grammar';

export interface BufferState {
  nodes: Node[];
  focus: null | Id;
  mode: BufferMode;
  altOpts: null | AltOpt[];
  termInput: null | string;
}

export enum BufferMode {
  Normal = 'Normal',
  TermInput = 'TermInput',
  AltOpts = 'AltOpts',
}

export interface AltOpt {
  prod: ProductionName;
}

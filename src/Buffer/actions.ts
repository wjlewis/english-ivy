import { Action } from '../types/action';

export enum ActionType {
  Input = 'Input',
  BailCommand = 'BailCommand',
  ShowAltOptions = 'ShowAltOptions',
  CreateSeqEntry = 'CreateSeqEntry',
  CreateStarEntry = 'CreateStarEntry',
  ChooseOpt = 'ChooseOpt',
  EditTerminal = 'EditTerminal',
  MoveToFirstChild = 'MoveToFirstChild',
  MoveToParent = 'MoveToParent',
  MoveToNextSibling = 'MoveToNextSibling',
  MoveToPreviousSibling = 'MoveToPreviousSibling',
}

export function Input(key: string): Action {
  return {
    type: ActionType.Input,
    payload: key,
  };
}

export function BailCommand(): Action {
  return {
    type: ActionType.BailCommand,
  };
}

export function ShowAltOptions(alts: string[]): Action {
  return {
    type: ActionType.ShowAltOptions,
    payload: alts,
  };
}

export function CreateSeqEntry(seq: string[]): Action {
  return {
    type: ActionType.CreateSeqEntry,
    payload: seq,
  };
}

export function CreateStarEntry(of: string): Action {
  return {
    type: ActionType.CreateStarEntry,
    payload: of,
  };
}

export function ChooseOpt(opt: string): Action {
  return {
    type: ActionType.ChooseOpt,
    payload: opt,
  };
}

export function EditTerminal(pattern?: RegExp): Action {
  return {
    type: ActionType.EditTerminal,
    payload: pattern,
  };
}

export function MoveToFirstChild(): Action {
  return {
    type: ActionType.MoveToFirstChild,
  };
}

export function MoveToParent(): Action {
  return {
    type: ActionType.MoveToParent,
  };
}

export function MoveToNextSibling(): Action {
  return {
    type: ActionType.MoveToNextSibling,
  };
}

export function MoveToPreviousSibling(): Action {
  return {
    type: ActionType.MoveToPreviousSibling,
  };
}

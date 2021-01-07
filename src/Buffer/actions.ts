import { Action } from '../types/action';
import { ProductionName } from '../types/grammar';

export enum ActionType {
  Input = 'Input',
  AddChild = 'AddChild',
  ToFirstChild = 'ToFirstChild',
  ToParent = 'ToParent',
  ToNextSibling = 'ToNextSibling',
  ToPrevSibling = 'ToPrevSibling',
  ToSumOptionsMode = 'ToSumOptionsMode',
  FilterSumOptions = 'FilterSumOptions',
  SelectSumOption = 'SelectSumOption',
  ReturnToNormalMode = 'ReturnToNormalMode',
  ToTerminalInputMode = 'ToTerminalInputMode',
  UpdateTerminal = 'UpdateTerminal',
  CommitTerminalValue = 'CommitTerminalValue',
}

export function Input(key: string): Action {
  return {
    type: ActionType.Input,
    payload: key,
  };
}

export function AddChild(prodName: ProductionName): Action {
  return {
    type: ActionType.AddChild,
    payload: prodName,
  };
}

export function ToFirstChild(): Action {
  return {
    type: ActionType.ToFirstChild,
  };
}

export function ToParent(): Action {
  return {
    type: ActionType.ToParent,
  };
}

export function ToNextSibling(): Action {
  return {
    type: ActionType.ToNextSibling,
  };
}

export function ToPrevSibling(): Action {
  return {
    type: ActionType.ToPrevSibling,
  };
}

export function ToSumOptionsMode(variants: ProductionName[]): Action {
  return {
    type: ActionType.ToSumOptionsMode,
    payload: variants,
  };
}

export function FilterSumOptions(filter: string): Action {
  return {
    type: ActionType.FilterSumOptions,
    payload: filter,
  };
}

export function SelectSumOption(): Action {
  return {
    type: ActionType.SelectSumOption,
  };
}

export function ReturnToNormalMode(): Action {
  return {
    type: ActionType.ReturnToNormalMode,
  };
}

export function ToTerminalInputMode(): Action {
  return {
    type: ActionType.ToTerminalInputMode,
  };
}

export function UpdateTerminal(value: string): Action {
  return {
    type: ActionType.UpdateTerminal,
    payload: value,
  };
}

export function CommitTerminalValue(): Action {
  return {
    type: ActionType.CommitTerminalValue,
  };
}

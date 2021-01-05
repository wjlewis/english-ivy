import { Action } from '../types/action';
import { ProductionName } from '../types/grammar';

export enum ActionType {
  Input = 'Input',
  AddChild = 'AddChild',
  ToFirstChild = 'ToFirstChild',
  ToParent = 'ToParent',
  ToNextSibling = 'ToNextSibling',
  ToPrevSibling = 'ToPrevSibling',
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

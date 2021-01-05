import { Action } from '../types/action';

export enum ActionType {
  Input = 'Input',
}

export function Input(key: string): Action {
  return {
    type: ActionType.Input,
    payload: key,
  };
}

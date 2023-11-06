export enum DialogType {
  Ok,
  OKCancel,
  YesNo,
}

export interface DialogData {
  title: string;
  description?: string;
  type: DialogType;
}

export interface DialogCallbacks {
  accept: () => void;
  cancel: () => void;
}

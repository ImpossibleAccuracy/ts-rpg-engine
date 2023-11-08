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
  ocAccept: () => void;
  onCancel: () => void;
  onClose: () => void;
}

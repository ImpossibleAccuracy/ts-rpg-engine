export enum DialogType {
  Ok,
  OKCancel,
  YesNo,
}

export interface DialogData {
  title: string;
  gravity?: string;
  description?: string;
  type: DialogType;
  closable?: boolean;
}

export interface DialogCallbacks {
  ocAccept: () => void;
  onCancel: () => void;
  onClose: () => void;
}

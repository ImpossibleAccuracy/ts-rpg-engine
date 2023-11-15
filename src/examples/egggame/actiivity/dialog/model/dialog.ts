import type { Model } from "@/library/api/models";

export interface DialogPerson {
  model: Model;
}

export interface DialogMessage {
  person: DialogPerson;
  content: string;
}

export interface Dialog {
  items: Array<DialogMessage>;
  extra: Map<string, any>;
}

export interface DialogCallbacks {
  onFinish: () => void;
}

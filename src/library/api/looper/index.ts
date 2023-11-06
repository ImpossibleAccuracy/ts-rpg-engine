export abstract class Looper {
  abstract startUiLooper(func: () => boolean): void;

  abstract startLogicLooper(func: () => boolean): void;
}

import { AbstractController } from "@/library/api/controller";

class MouseState {
  public x: number;
  public y: number;

  public leftButton: boolean;
  public rightButton: boolean;
  public middleButton: boolean;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.leftButton = false;
    this.rightButton = false;
    this.middleButton = false;
  }
}

export interface OnKeyPressListener {
  onKeyPress: (key: string) => void;
}

export class MouseKeyboardController extends AbstractController {
  private readonly keys: Map<string, boolean> = new Map();
  private readonly mouseState: MouseState = new MouseState();

  private onKeyPressListeners: Array<OnKeyPressListener> =
    new Array<OnKeyPressListener>();

  constructor(screenOffsetX: number = 0, screenOffsetY: number = 0) {
    super();

    window.addEventListener("keyup", (e) => {
      const key = this.formatKeyName(e.key);
      this.keys.set(key, false);
    });

    window.addEventListener("keydown", (e) => {
      const key = this.formatKeyName(e.key);
      this.keys.set(key, true);
    });

    window.addEventListener("keypress", (e) => {
      const key = this.formatKeyName(e.key);

      this.onKeyPressListeners.forEach((l) => l.onKeyPress(key));
    });

    window.addEventListener("mousemove", (e) => {
      this.mouseState.x = e.screenX - screenOffsetX;
      this.mouseState.y = e.screenY - screenOffsetY;
    });

    window.addEventListener("mouseup", (e) => {
      this.updateMouseButtons(e.buttons);
    });

    window.addEventListener("mousedown", (e) => {
      this.updateMouseButtons(e.buttons);
    });
  }

  public get left(): boolean {
    return this.isKeyPressed("a", "arrowleft");
  }

  public get right(): boolean {
    return this.isKeyPressed("d", "arrowright");
  }

  public get top(): boolean {
    return this.isKeyPressed("w", "arrowup");
  }

  public get down(): boolean {
    return this.isKeyPressed("s", "arrowdown");
  }

  public attachKeyPressListener(listener: OnKeyPressListener) {
    this.onKeyPressListeners.push(listener);
  }

  public detachKeyPressListener(listener: OnKeyPressListener) {
    this.onKeyPressListeners = this.onKeyPressListeners.filter(
      (el) => el !== listener,
    );
  }

  public isKeyPressed(...keys: Array<string>): boolean {
    for (const data of this.keys) {
      const key = data[0].toLowerCase();
      const value = data[1];

      const found = keys.find((el) => key === el.toLowerCase());

      if (found && value) {
        return true;
      }
    }

    return false;
  }

  private formatKeyName(key: string): string {
    if (key == " ") {
      return "space";
    } else {
      return key.toLowerCase();
    }
  }

  private updateMouseButtons(buttons: number) {
    this.mouseState.leftButton = buttons == 1;
    this.mouseState.rightButton = buttons == 2;
    this.mouseState.middleButton = buttons == 4;
  }
}

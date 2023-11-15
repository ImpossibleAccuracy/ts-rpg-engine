import { AbstractActivity } from "@/library/api/activity";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type {
  Dialog,
  DialogCallbacks,
} from "@/examples/egggame/actiivity/dialog/model/dialog";
import { DialogVisualizer } from "@/examples/egggame/actiivity/dialog/visualizer";
import {
  ControllerAction,
  MouseKeyboardController,
  type OnControllerActionListener,
} from "@/library/impl/controller";
import { ModelLoader } from "@/library/impl/models/loaders";
import { GameEngine } from "@/library/api/engine";

export class NpcDialog
  extends AbstractActivity<CanvasRenderer, DialogVisualizer>
  implements OnControllerActionListener
{
  private static readonly NextDialogMessageKeys = [
    "space",
    "e",
    "escape",
    "enter",
  ];

  private readonly dialog: Dialog;
  private readonly callbacks: DialogCallbacks;
  private activeMessageIndex: number = 0;

  constructor(
    renderer: CanvasRenderer,
    modelLoader: ModelLoader,
    dialog: Dialog,
    callbacks: DialogCallbacks,
  ) {
    super(new DialogVisualizer(renderer, dialog, modelLoader));
    this.dialog = dialog;
    this.callbacks = callbacks;
  }

  public onAction(action: ControllerAction): void {
    if (
      action.type == "keypress" &&
      NpcDialog.NextDialogMessageKeys.includes(action.name)
    ) {
      if (this.activeMessageIndex + 1 >= this.dialog.items.length) {
        this.finish();
      } else {
        this.activeMessageIndex += 1;
      }
    }
  }

  public onAttach(gameEngine: GameEngine<CanvasRenderer>) {
    super.onAttach(gameEngine);

    const controller = gameEngine.controller;

    if (controller instanceof MouseKeyboardController) {
      controller.attachKeyPressListener(this);
    }
  }

  public draw(): void {
    const activeItem = this.dialog.items[this.activeMessageIndex];

    this.visualizer.display(activeItem);
  }

  public update(): void {}

  public finish() {
    if (!this.isFinished) {
      this.callbacks.onFinish();
    }

    super.finish();
  }
}

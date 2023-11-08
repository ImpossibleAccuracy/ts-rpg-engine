import { AbstractActivity } from "@/library/api/activity";
import { DialogVisualizer } from "@/library/impl/visualizer/dialog";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { DialogCallbacks, DialogData } from "@/library/impl/data/dialog";
import {
  ControllerAction,
  MouseKeyboardController,
  type OnControllerActionListener,
} from "@/library/impl/controller";
import { GameEngine } from "@/library/api/engine";

export class DialogActivity
  extends AbstractActivity<CanvasRenderer, DialogVisualizer>
  implements OnControllerActionListener
{
  private readonly dialogData: DialogData;
  private readonly dialogCallbacks: DialogCallbacks;

  private activeButtonIndex: number = 0;

  constructor(
    renderer: CanvasRenderer,
    dialogData: DialogData,
    dialogCallbacks: DialogCallbacks,
  ) {
    super(new DialogVisualizer(renderer));

    this.dialogData = dialogData;
    this.dialogCallbacks = dialogCallbacks;
  }

  onAttach(game: GameEngine<CanvasRenderer>) {
    super.onAttach(game);

    if (game.controller instanceof MouseKeyboardController) {
      game.controller.attachKeyPressListener(this);
    }
  }

  onDetach() {
    const game = this.requireGameEngine();
    if (game.controller instanceof MouseKeyboardController) {
      game.controller.detachKeyPressListener(this);
    }

    super.onDetach();
  }

  draw(): void {
    this.visualizer.onDraw(this.dialogData, this.activeButtonIndex);
  }

  public update(): void {}

  public onAction(action: ControllerAction): void {
    if (action.type == "keypress") {
      if (action.name == "d" || action.name == "arrowright") {
        this.activeButtonIndex += 1;
      } else if (action.name == "a" || action.name == "arrowleft") {
        this.activeButtonIndex -= 1;
      } else if (action.name == "escape") {
        this.finish();
      }
    }
  }

  finish() {
    if (!this.isFinished) {
      this.dialogCallbacks.onClose();
    }

    super.finish();
  }
}

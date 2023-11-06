import { AbstractActivity } from "@/library/api/activity";
import { DialogVisualizer } from "@/library/impl/visualizer/dialog";
import { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import type { DialogCallbacks, DialogData } from "@/library/impl/model/dialog";
import {
  MouseKeyboardController,
  type OnKeyPressListener,
} from "@/library/impl/controller";
import type { GameEngine } from "@/library/api/engine";

export class DialogActivity
  extends AbstractActivity<CanvasRenderer, DialogVisualizer>
  implements OnKeyPressListener
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
      game.controller.attachKeyPressListener(this);
    }

    super.onDetach();
  }

  draw(): void {
    this.visualizer.onDraw(this.dialogData, this.activeButtonIndex);
  }

  public update(): void {}

  public onKeyPress(key: string): void {
    if (key == "d" || key == "arrowright") {
      this.activeButtonIndex += 1;
    } else if (key == "a" || key == "arrowleft") {
      this.activeButtonIndex -= 1;
    }
  }
}

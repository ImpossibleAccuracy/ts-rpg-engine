import { CanvasVisualizer } from "@/library/impl/visualizer/world";
import type { CanvasRenderer } from "@/library/impl/visualizer/renderer";
import { ModelLoader } from "@/library/impl/models/loaders";
import type {
  Dialog,
  DialogMessage,
} from "@/examples/egggame/actiivity/dialog/model/dialog";
import { ImageModel } from "@/library/impl/models/imageModel";

interface Dimensions {
  width: number;
  height: number;
}

interface TextDimensions {
  lineHeight: number;
  dimensions: Dimensions;
  lines: string[];
}

const dialogBoxTile = {
  boxHeight: 256,
  boxPaddingStart: 36,
  boxPaddingEnd: 60,
  personBoxSize: 184,
  contentBoxMarginStart: 44,
  contentBoxChunkSize: 56,
};

const dialogDimensions = {
  boxHeight: 128,
  boxPaddingStart: 18,
  boxPaddingEnd: 30,
  personBoxSize: 92,
  contentBoxMarginStart: 22,
  contentBoxChunkSize: 28,
  personSize: 64,
  personPosX: 32,
  personPosY: 30,
  textPosY: 44,
};

export class DialogVisualizer extends CanvasVisualizer {
  private static readonly maxDialogWidth: number = 350;
  private static readonly minDialogWidth: number = 200;
  private static readonly fontSize: number = 16;
  private static readonly fontName: string = "Courier New";

  private dialogBox?: ImageModel;
  private readonly dialogPersonImages: Map<string, ImageModel> = new Map<
    string,
    ImageModel
  >();

  constructor(
    renderer: CanvasRenderer,
    dialog: Dialog,
    private readonly modelLoader: ModelLoader,
  ) {
    super(renderer);

    this.loadDialogBox();
  }

  public display(message: DialogMessage) {
    if (!this.dialogBox) return;

    this.renderer.context.font = `${DialogVisualizer.fontSize}px ${DialogVisualizer.fontName}`;

    const widthWithoutText =
      dialogDimensions.boxPaddingStart +
      dialogDimensions.boxPaddingEnd +
      dialogDimensions.personBoxSize +
      dialogDimensions.contentBoxMarginStart;

    const textMeasurement = this.getTextMeasurement(
      message.content,
      DialogVisualizer.maxDialogWidth,
    );

    const chucksCount = Math.ceil(
      Math.max(
        DialogVisualizer.minDialogWidth,
        textMeasurement.dimensions.width,
      ) / dialogDimensions.contentBoxChunkSize,
    );

    const resultWidth =
      widthWithoutText + chucksCount * dialogDimensions.contentBoxChunkSize;

    const dialogStartX = this.renderer.canvas.width / 2 - resultWidth / 2;
    const dialogStartY = this.renderer.canvas.height - 200;

    this.drawOther(chucksCount, dialogStartX, dialogStartY);
    this.drawPersonBox(message, dialogStartX, dialogStartY);
    this.drawContentBox(
      chucksCount,
      textMeasurement,
      dialogStartX,
      dialogStartY,
    );
  }

  public async drawPersonBox(
    message: DialogMessage,
    dialogStartX: number,
    dialogStartY: number,
  ) {
    this.renderer.context.drawImage(
      this.dialogBox!.image,

      dialogBoxTile.boxPaddingStart,
      0,
      dialogBoxTile.personBoxSize,
      dialogBoxTile.boxHeight,

      dialogStartX + dialogDimensions.boxPaddingStart,
      dialogStartY,
      dialogDimensions.personBoxSize,
      dialogDimensions.boxHeight,
    );

    this.renderer.drawModelManually(
      message.person.model,
      dialogStartX + dialogDimensions.personPosX,
      dialogStartY + dialogDimensions.personPosY,
      dialogDimensions.personSize,
      dialogDimensions.personSize,
    );
  }

  public drawContentBox(
    chucksCount: number,
    textMeasurement: TextDimensions,
    dialogStartX: number,
    dialogStartY: number,
  ) {
    const context = this.renderer.context;

    for (let i = 0; i < chucksCount; i++) {
      context.drawImage(
        this.dialogBox!.image,

        dialogBoxTile.boxPaddingStart +
          dialogBoxTile.personBoxSize +
          dialogBoxTile.contentBoxMarginStart,
        0,
        dialogBoxTile.contentBoxChunkSize,
        dialogBoxTile.boxHeight,

        dialogStartX +
          dialogDimensions.boxPaddingStart +
          dialogDimensions.personBoxSize +
          dialogDimensions.contentBoxMarginStart +
          dialogDimensions.contentBoxChunkSize * i,
        dialogStartY,
        dialogDimensions.contentBoxChunkSize,
        dialogDimensions.boxHeight,
      );
    }

    for (let i = 0; i < textMeasurement.lines.length; i++) {
      context.fillStyle = "black";

      context.fillText(
        textMeasurement.lines[i],
        dialogStartX +
          dialogDimensions.boxPaddingStart +
          dialogDimensions.personBoxSize +
          dialogDimensions.contentBoxMarginStart,
        dialogStartY +
          dialogDimensions.textPosY +
          DialogVisualizer.fontSize * (i + 1),
      );
    }
  }

  public drawOther(
    chucksCount: number,
    dialogStartX: number,
    dialogStartY: number,
  ) {
    this.renderer.context.drawImage(
      this.dialogBox!.image,

      0,
      0,
      dialogBoxTile.boxPaddingStart,
      dialogBoxTile.boxHeight,

      dialogStartX,
      dialogStartY,
      dialogDimensions.boxPaddingStart,
      dialogDimensions.boxHeight,
    );

    this.renderer.context.drawImage(
      this.dialogBox!.image,

      dialogBoxTile.boxPaddingStart + dialogBoxTile.personBoxSize,
      0,
      dialogBoxTile.contentBoxMarginStart,
      dialogBoxTile.boxHeight,

      dialogStartX +
        dialogDimensions.boxPaddingStart +
        dialogDimensions.personBoxSize,
      dialogStartY,
      dialogDimensions.contentBoxMarginStart,
      dialogDimensions.boxHeight,
    );

    this.renderer.context.drawImage(
      this.dialogBox!.image,

      this.dialogBox!.width - dialogBoxTile.boxPaddingEnd,
      0,
      dialogBoxTile.boxPaddingEnd,
      dialogBoxTile.boxHeight,

      dialogStartX +
        dialogDimensions.boxPaddingStart +
        dialogDimensions.personBoxSize +
        dialogDimensions.contentBoxMarginStart +
        dialogDimensions.contentBoxChunkSize * chucksCount,
      dialogStartY,
      dialogDimensions.boxPaddingEnd,
      dialogDimensions.boxHeight,
    );
  }

  private loadDialogBox() {
    this.modelLoader.load("ui/dialog_box.png").then((data) => {
      if (!(data instanceof ImageModel)) {
        throw new Error("Illegal model type");
      }

      this.dialogBox = data;
    });
  }

  private getTextMeasurement(text: string, maxWidth: number): TextDimensions {
    const textMetrics = this.renderer.context.measureText(text);
    const lineHeight =
      textMetrics.actualBoundingBoxAscent +
      textMetrics.actualBoundingBoxDescent;

    if (textMetrics.width > maxWidth) {
      const parts = text.split(" ").map((el) => el.trim());

      let cols = 0;
      const lines = new Array<string>();

      let prevPos = 0;
      for (let i = 0; i < parts.length; i++) {
        const substr = parts
          .slice(prevPos, i + 1)
          .join(" ")
          .trim();

        const metrics = this.renderer.context.measureText(substr);

        if (metrics.width >= maxWidth) {
          lines.push(parts.slice(prevPos, i).join(" ").trim());

          prevPos = i;
          cols += 1;
        }
      }

      if (prevPos < parts.length) {
        lines.push(parts.slice(prevPos).join(" ").trim());

        cols += 1;
      }

      return {
        lineHeight: lineHeight,
        lines: lines,
        dimensions: {
          width: maxWidth,
          height: cols * lineHeight,
        },
      };
    } else {
      return {
        lineHeight: lineHeight,
        lines: [text],
        dimensions: {
          width: textMetrics.width,
          height: lineHeight,
        },
      };
    }
  }
}

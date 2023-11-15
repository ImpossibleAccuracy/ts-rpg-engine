import { Model } from "@/library/api/models";

export interface TextModelMetadata {
  fontSize?: number;
  fontName?: string;
  fontColor?: string;
  isFontBold?: boolean;
}

export class TextModel extends Model {
  constructor(
    public readonly text: string,
    public readonly metadata?: TextModelMetadata,
  ) {
    super();
  }
}

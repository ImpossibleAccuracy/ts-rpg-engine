import type { Rect } from "@/library/api/data/rect";
import type { Model } from "@/library/api/models";

export interface Hint<R extends Rect> {
  position: R;
  content: Model;
  timeToLive: number;
  createdAt: number;
}

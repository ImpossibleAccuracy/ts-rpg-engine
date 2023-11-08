import type { SpriteMetaData } from "@/library/api/visualizer/model";
import type { SpriteImageMetaData } from "@/library/impl/models";

export interface CoordinatesJson {
  x: number;
  y: number;
}

export interface DimensionsJson {
  w: number;
  h: number;
}

export type RectJson = CoordinatesJson & DimensionsJson;

export type CollisionType = RectJson | Array<RectJson>;

interface BaseModelJson {
  type?: string;
  metadata?: unknown;
  model_dimensions?: RectJson;
}

export interface ModelJson extends BaseModelJson {
  type: "model" | undefined;
  name: string;
}

export interface SpriteModelJson extends BaseModelJson {
  type: "sprite";
  name: string;
  props?: SpriteImageMetaData;
}

export interface ArraySpriteModelJson extends BaseModelJson {
  type: "sprite_array";
  items: Array<string>;
  props?: SpriteMetaData;
}

export type ModelType = ModelJson | SpriteModelJson | ArraySpriteModelJson;

export interface ControllerJson {
  name: string;
  meta?: unknown;
}

export type ControllerType = string | ControllerJson;

export interface EntityJson {
  model?: ModelType;
  is_material?: boolean;
  position: CoordinatesJson;
  size: DimensionsJson;
  order: number;
  collision?: CollisionType;
  controller?: ControllerType;
}

export interface EntityCollectionJson {
  order: number;
  model: ModelType;
  items: Array<EntityJson>;
}

export interface LevelJson {
  size: DimensionsJson;
  objects: Map<string, EntityJson | EntityCollectionJson>;
}

export function instanceOfModel(object: object): object is ModelJson {
  return (!("type" in object) || object.type == "model") && "name" in object;
}

export function instanceOfSpriteModel(
  object: object,
): object is SpriteModelJson {
  return "name" in object && "type" in object && object.type == "sprite";
}

export function instanceOfArraySpriteModel(
  object: object,
): object is ArraySpriteModelJson {
  return "type" in object && object.type == "sprite_array" && "items" in object;
}

export function instanceOfEntity(object: object): object is EntityJson {
  return "position" in object && "size" in object && "order" in object;
}

export function instanceOfEntityCollection(
  object: object,
): object is EntityCollectionJson {
  return "model" in object && "items" in object;
}

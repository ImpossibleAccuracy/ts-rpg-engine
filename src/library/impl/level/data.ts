import type { SpriteImageMetaData } from "@/library/impl/models/spriteImageModel";
import type { SpriteMetaData } from "@/library/api/models/spriteModel";
import type { ImageModelMetaData } from "@/library/impl/models/imageModel";

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
  type: string;
}

export interface ModelJson extends BaseModelJson {
  type: "model";
  name: string;
  props?: ImageModelMetaData;
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

export type TilesetModelRowJson = Array<TilesetModelCellJson | string>;
export type TilesetModelCellJson = number[] | string;

export interface TilesetModelJson extends BaseModelJson {
  type: "tileset";
  name: string;
  start_position?: CoordinatesJson;
  chunk_size: DimensionsJson;
  tiles: Array<TilesetModelRowJson>;
}

export type SingleModelType =
  | ModelJson
  | TilesetModelJson
  | SpriteModelJson
  | ArraySpriteModelJson;

export interface ModelsArrayJson extends BaseModelJson {
  items: Array<SingleModelType>;
}

export type ModelType =
  | Array<SingleModelType>
  | ModelsArrayJson
  | SingleModelType;

export interface ControllerJson {
  name: string;
  meta?: unknown;
}

export type ControllerType = string | ControllerJson;

export interface BaseEntityJson {
  attach?: boolean;
  order: number;
  model?: ModelType;
  is_material?: boolean;
  collision?: CollisionType;
  controller?: ControllerType;
  size?: DimensionsJson;
}

export interface EntityJson extends BaseEntityJson {
  position: CoordinatesJson;
}

export interface EntityCollectionJson extends BaseEntityJson {
  items: Array<EntityType>;
}

export type EntityType = EntityJson | EntityCollectionJson;

export interface LevelJson {
  size: DimensionsJson;
  objects: Map<string, EntityType>;
}

export function instanceOfModel(object: object): object is ModelJson {
  return "type" in object && object.type == "model" && "name" in object;
}

export function instanceOfSpriteModel(
  object: object,
): object is SpriteModelJson {
  return "type" in object && object.type == "sprite" && "name" in object;
}

export function instanceOfTilesetModel(
  object: object,
): object is TilesetModelJson {
  return (
    "type" in object &&
    object.type == "tileset" &&
    "chunk_size" in object &&
    "tiles" in object
  );
}

export function instanceOfArraySpriteModel(
  object: object,
): object is ArraySpriteModelJson {
  return "type" in object && object.type == "sprite_array" && "items" in object;
}

export function instanceOfModelArray(
  object: object,
): object is ModelsArrayJson {
  return "type" in object && object.type == "model_array";
}

export function instanceOfEntity(object: object): object is EntityJson {
  return "position" in object;
}

export function instanceOfEntityCollection(
  object: object,
): object is EntityCollectionJson {
  return "items" in object;
}

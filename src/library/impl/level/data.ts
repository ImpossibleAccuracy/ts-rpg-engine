interface Coordinates {
  x: number;
  y: number;
}

interface Dimensions {
  w: number;
  h: number;
}

export interface ModelJson {
  name: string;
  model_dimensions?: Dimensions;
}

export interface SpriteModelJson {
  update_rate?: number;
  items: Array<string>;
  model_dimensions?: Dimensions;
}

export type ModelType = ModelJson | SpriteModelJson;

export interface ControllerJson {
  name: string;
  meta?: unknown;
}

export type ControllerType = string | ControllerJson;

export interface EntityJson {
  model?: ModelType;
  is_material?: boolean;
  position: Coordinates;
  size: Dimensions;
  order: number;
  controller?: ControllerType;
}

export interface EntityCollectionJson {
  order: number;
  model: ModelType;
  items: Array<EntityJson>;
}

export interface LevelJson {
  objects: Map<string, EntityJson | EntityCollectionJson>;
}

export function instanceOfModel(object: object): object is ModelJson {
  return "name" in object;
}

export function instanceOfSpriteModel(
  object: object,
): object is SpriteModelJson {
  return "items" in object;
}

export function instanceOfEntity(object: object): object is EntityJson {
  return "position" in object && "size" in object && "order" in object;
}

export function instanceOfEntityCollection(
  object: object,
): object is EntityCollectionJson {
  return "model" in object && "items" in object;
}

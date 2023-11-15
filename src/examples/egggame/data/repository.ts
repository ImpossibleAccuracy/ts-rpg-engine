export interface EggData {
  x: number;
  y: number;
}

export interface EnemyData {
  x: number;
  y: number;
}

export async function fetchAllEggs(): Promise<Array<EggData>> {
  const response = await fetch("http://localhost:3000/eggs");

  if (response.ok) {
    return (await response.json()) as Array<EggData>;
  } else {
    throw new Error("Fetch failed: " + response.statusText);
  }
}

export async function fetchAllGoblins(): Promise<Array<EnemyData>> {
  const response = await fetch("http://localhost:3000/goblin");

  if (response.ok) {
    return (await response.json()) as Array<EnemyData>;
  } else {
    throw new Error("Fetch failed: " + response.statusText);
  }
}

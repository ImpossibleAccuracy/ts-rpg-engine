const isDev = process.env.NODE_ENV == "development";

const assetsPath = isDev ? "/src/assets/egg/" : "/assets/egg/";

export const config = {
  resources: {
    baseUrl: assetsPath,
    imageUrl: assetsPath + "image/",
    levelUrl: assetsPath + "levels/",
  },
};

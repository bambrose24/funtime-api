import NodeCache from "node-cache";
export const memoryCache = new NodeCache({ stdTTL: 180 });

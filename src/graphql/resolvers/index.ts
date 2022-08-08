import MakePicksResolver from "./make-picks";
import RegisterResolver from "./register";

const resolvers = [RegisterResolver, MakePicksResolver] as const;

export default resolvers;

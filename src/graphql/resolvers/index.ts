import { register } from "./register";

const resolvers = {
  Query: {},
  Mutation: {
    register,
  },
};
export default resolvers;

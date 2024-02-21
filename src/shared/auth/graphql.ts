import {ApolloContext} from '@graphql/server/types';
import {AuthChecker} from 'type-graphql';
import {getUser} from './user';

export enum Role {
  User = 'user',
  LeagueAdmin = 'league_admin',
  SysAdmin = 'sys_admin',
}

export const customAuthChecker: AuthChecker<ApolloContext, Role> = async (
  {args, context, info, root},
  roles
) => {
  // TODO generic auth somehow??
  const user = getUser();
  if (roles.includes(Role.SysAdmin)) {
    return user?.dbUser?.email === 'bambrose24@gmail.com';
  }
  console.log('hi');
  return true;
};

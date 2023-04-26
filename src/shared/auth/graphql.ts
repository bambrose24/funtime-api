import {ApolloPrismaContext} from '@src/graphql/server/types';
import {AuthChecker} from 'type-graphql';
import {getUser} from './user';

export enum Role {
  User = 'user',
  LeagueAdmin = 'league_admin',
  SysAdmin = 'sys_admin',
}

export const customAuthChecker: AuthChecker<ApolloPrismaContext, Role> = async (
  {args, context, info, root},
  roles
) => {
  // TODO generic auth somehow??
  const user = getUser();
  console.log('auth checker', user, roles);
  if (roles.includes(Role.SysAdmin)) {
    return user?.email === 'bambrose24@gmail.com';
  }
  return true;
};

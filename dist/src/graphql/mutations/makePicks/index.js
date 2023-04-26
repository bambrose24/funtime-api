'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o['default'] = v;
      });
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.DEFAULT_ROLE = exports.LEAGUE_ID = void 0;
const datastore_1 = __importDefault(require('@shared/datastore'));
const type_graphql_1 = require('type-graphql');
const TypeGraphQL = __importStar(require('@generated/type-graphql'));
const email_1 = require('@shared/email');
exports.LEAGUE_ID = 7;
exports.DEFAULT_ROLE = 'player';
let MakePicksResponse = class MakePicksResponse {
  success;
  user;
};
__decorate(
  [(0, type_graphql_1.Field)(), __metadata('design:type', Boolean)],
  MakePicksResponse.prototype,
  'success',
  void 0
);
__decorate(
  [(0, type_graphql_1.Field)(() => TypeGraphQL.User), __metadata('design:type', Object)],
  MakePicksResponse.prototype,
  'user',
  void 0
);
MakePicksResponse = __decorate([(0, type_graphql_1.ObjectType)()], MakePicksResponse);
let GamePick = class GamePick {
  game_id;
  winner;
  is_random;
  score;
};
__decorate(
  [(0, type_graphql_1.Field)(() => type_graphql_1.Int), __metadata('design:type', Number)],
  GamePick.prototype,
  'game_id',
  void 0
);
__decorate(
  [(0, type_graphql_1.Field)(() => type_graphql_1.Int), __metadata('design:type', Number)],
  GamePick.prototype,
  'winner',
  void 0
);
__decorate(
  [(0, type_graphql_1.Field)(), __metadata('design:type', Boolean)],
  GamePick.prototype,
  'is_random',
  void 0
);
__decorate(
  [
    (0, type_graphql_1.Field)(() => type_graphql_1.Int, {nullable: true}),
    __metadata('design:type', Number),
  ],
  GamePick.prototype,
  'score',
  void 0
);
GamePick = __decorate([(0, type_graphql_1.InputType)()], GamePick);
let MakePicksResolver = class MakePicksResolver {
  async makePicks(member_id, picks) {
    const {week, season} = await upsertWeekPicksForMember(member_id, picks);
    try {
      await (0, email_1.sendPickSuccessEmail)(member_id, week, season);
    } catch (e) {
      console.log('email error', e);
    }
    const user = await datastore_1.default.leagueMember
      .findFirstOrThrow({where: {membership_id: {equals: member_id}}})
      .people();
    return {success: true, user: user};
  }
};
__decorate(
  [
    (0, type_graphql_1.Mutation)(() => MakePicksResponse),
    __param(
      0,
      (0, type_graphql_1.Arg)('member_id', () => type_graphql_1.Int)
    ),
    __param(
      1,
      (0, type_graphql_1.Arg)('picks', () => [GamePick])
    ),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Array]),
    __metadata('design:returntype', Promise),
  ],
  MakePicksResolver.prototype,
  'makePicks',
  null
);
MakePicksResolver = __decorate([(0, type_graphql_1.Resolver)()], MakePicksResolver);
async function upsertWeekPicksForMember(member_id, picks) {
  const user = await datastore_1.default.leagueMember
    .findUniqueOrThrow({where: {membership_id: member_id}})
    .people();
  if (!user) {
    throw new Error('Could not make picks for unknown member');
  }
  const games = await datastore_1.default.game.findMany({
    where: {gid: {in: picks.map(g => g.game_id)}},
  });
  // check if they're all the same week
  const submissionWeeksAndSeasons = games.reduce(
    (acc, curr) => acc.add(`${curr.week},${curr.season}`),
    new Set()
  );
  if (submissionWeeksAndSeasons.size > 1) {
    throw new Error('Multiple weeks were submitted at the same time');
  }
  const week = games[0].week;
  const season = games[0].season;
  // TODO check if the person is able to make picks for the week based on game start time
  // TODO let picks happen until the "majority" time
  const existingPick = await datastore_1.default.pick.findFirst({
    where: {member_id: {equals: member_id}},
  });
  if (existingPick) {
    await datastore_1.default.pick.deleteMany({
      where: {
        member_id: {equals: member_id},
        week: {equals: week},
        season: {equals: season},
      },
    });
  }
  await datastore_1.default.pick.createMany({
    data: picks.map(({game_id, winner, score, is_random}) => {
      const game = games.find(g => g.gid === game_id);
      const loserId = game.away === winner ? game.home : game?.away;
      return {
        uid: user.uid,
        member_id,
        week,
        season,
        gid: game_id,
        winner,
        loser: loserId,
        score,
        is_random,
      };
    }),
  });
  return {
    week,
    season,
  };
}
exports.default = MakePicksResolver;

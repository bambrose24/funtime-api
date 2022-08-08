import datastore from "@shared/datastore";
import { People } from "@prisma/client";
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";
import * as TypeGraphQL from "@generated/type-graphql";
import { sendPickSuccessEmail } from "@shared/email";
export const LEAGUE_ID = 7;
export const DEFAULT_ROLE = "player";

@ObjectType()
class MakePicksResponse {
  @Field()
  success: boolean;
  @Field(() => TypeGraphQL.People)
  user: People;
}

@InputType()
class GamePick {
  @Field(() => Int)
  game_id: number;
  @Field(() => Int)
  winner: number;
  @Field()
  is_random: boolean;
  @Field(() => Int, { nullable: true })
  score?: number;
}

@Resolver()
class MakePicksResolver {
  @Mutation(() => MakePicksResponse)
  async makePicks(
    @Arg("member_id", () => Int) member_id: number,
    @Arg("picks", () => [GamePick]) picks: GamePick[]
  ): Promise<MakePicksResponse> {
    const { week, season } = await upsertWeekPicksForMember(member_id, picks);

    try {
      await sendPickSuccessEmail(member_id, week, season);
    } catch (e) {
      console.log("email error", e);
    }

    const user = await datastore.leagueMembers
      .findFirstOrThrow({ where: { membership_id: { equals: member_id } } })
      .People();

    return { success: true, user: user as People };
  }
}

async function upsertWeekPicksForMember(
  member_id: number,
  picks: Array<GamePick>
): Promise<{ week: number; season: number }> {
  const user = await datastore.leagueMembers
    .findUniqueOrThrow({ where: { membership_id: member_id } })
    .People();

  if (!user) {
    throw new Error("Could not make picks for unknown member");
  }

  const games = await datastore.games.findMany({
    where: { gid: { in: picks.map((g) => g.game_id) } },
  });

  // check if they're all the same week
  const submissionWeeksAndSeasons = games.reduce(
    (acc, curr) => acc.add(`${curr.week},${curr.season}`),
    new Set<string>()
  );
  if (submissionWeeksAndSeasons.size > 1) {
    throw new Error("Multiple weeks were submitted at the same time");
  }
  const week = games[0].week;
  const season = games[0].season;

  // TODO check if the person is able to make picks for the week based on game start time

  // TODO let picks happen until the "majority" time

  const existingPick = await datastore.picks.findFirst({
    where: { member_id: { equals: member_id } },
  });

  if (existingPick) {
    await datastore.picks.deleteMany({
      where: {
        member_id: { equals: member_id },
        week: { equals: week },
        season: { equals: season },
      },
    });
  }

  await datastore.picks.createMany({
    data: picks.map(({ game_id, winner, score, is_random }) => {
      const game = games.find((g) => g.gid === game_id)!;
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

export default MakePicksResolver;

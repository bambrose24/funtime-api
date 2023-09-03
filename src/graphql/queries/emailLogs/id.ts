import {FieldResolver, Resolver, Root, ID, ObjectType, Field} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {EmailLogs} from '@prisma/client';
import {resend} from '@shared/email/client';

@ObjectType()
class ResendEmail {
  @Field()
  bcc: string[] | null;

  @Field()
  cc: string[] | null;

  @Field()
  created_at: string;

  @Field()
  from: string;

  @Field()
  html: string | null;

  @Field()
  id: string;

  @Field()
  last_event: string;

  @Field()
  reply_to: string[] | null;

  @Field()
  subject: string;

  @Field()
  text: string | null;

  @Field()
  to: string[];
}

@Resolver(() => TypeGraphQL.EmailLogs)
export default class GameID {
  @FieldResolver(_type => ID)
  async id(@Root() emailLog: EmailLogs): Promise<string> {
    return emailLog.email_log_id;
  }

  @FieldResolver(_type => ResendEmail, {nullable: true})
  async email(@Root() emailLog: EmailLogs): Promise<ResendEmail | null> {
    if (!emailLog.resend_id) {
      return null;
    }
    const response = await resend.emails.get(emailLog.resend_id);
    if (!response) {
      return null;
    }
    return response;
  }
}

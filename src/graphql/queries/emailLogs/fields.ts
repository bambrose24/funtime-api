import {FieldResolver, Resolver, Root, ID, ObjectType, Field} from 'type-graphql';
import * as TypeGraphQL from '@generated/type-graphql';
import {EmailLogs} from '@prisma/client';
import {resend} from '@shared/email/client';

@ObjectType()
class ResendEmail {
  @Field(_type => [String!], {nullable: true})
  bcc: string[] | null;

  @Field(_type => [String!], {nullable: true})
  cc: string[] | null;

  @Field(_type => String)
  created_at: string;

  @Field(_type => String)
  from: string;

  @Field(_type => String, {nullable: true})
  html: string | null;

  @Field(_type => String)
  id: string;

  @Field(_type => String)
  last_event: string;

  @Field(_type => [String!], {nullable: true})
  reply_to: string[] | null;

  @Field(_type => String)
  subject: string;

  @Field(_type => String, {nullable: true})
  text: string | null;

  @Field(_type => [String!])
  to: string[];
}

@Resolver(() => TypeGraphQL.EmailLogs)
export default class EmailLogsFields {
  @FieldResolver(_type => ID)
  async id(@Root() emailLog: EmailLogs): Promise<string> {
    return emailLog.email_log_id;
  }

  @FieldResolver(_type => ResendEmail, {nullable: true})
  async email(@Root() emailLog: EmailLogs): Promise<ResendEmail | null> {
    try {
      if (!emailLog.resend_id) {
        return null;
      }
      const response = await resend.emails.get(emailLog.resend_id);
      if (!response) {
        return null;
      }
      return response;
    } catch (e) {
      console.error(`Error trying to read resend email ${emailLog.resend_id}: ${e}`);
      return null;
    }
  }
}

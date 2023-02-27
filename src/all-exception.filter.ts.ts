import * as Sentry from "@sentry/node";
import { Catch, ArgumentsHost } from "@nestjs/common";
import { BaseWsExceptionFilter } from "@nestjs/websockets";

@Catch()
export class AllExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error("Unhandled exception:", exception, host);
    Sentry.captureException(exception);
    super.catch(exception, host);
  }
}

import { handleSchedule } from "@vercel/schedules";
import { runScheduledDuePushJob } from "@/modules/notifications/services/web-push-service";

export const POST = handleSchedule(async (metadata) => {
  const result = await runScheduledDuePushJob();
  console.log(
    `[schedule:${metadata.name}] exec=${metadata.executionId} users=${result.users} sent=${result.sent}`
  );
});

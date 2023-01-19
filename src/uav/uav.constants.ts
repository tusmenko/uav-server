export const CRITICAL_CLIMB = Number(process.env.CRITICAL_CLIMB ?? 50);
export const INACTIVE_AFTER_MINUTES = Number(
  process.env.INACTIVE_AFTER_MINUTES ?? 1
);
export const DISABLED_AFTER_MINUTES = Number(
  process.env.DISABLED_AFTER_MINUTES ?? 5
);
export const CONSIDER_NEW_AFTER_MINUTES = Number(
  process.env.CONSIDER_NEW_AFTER_MINUTES ?? 30
);
export const CLEAR_EVENT_AFTER_MINUTES = Number(
  process.env.CLEAR_EVENT_AFTER_MINUTES ?? 60
);
export const CLEAR_POINTS_AFTER_MINUTES = Number(
  process.env.CLEAR_POINTS_AFTER_MINUTES ?? 1440
);

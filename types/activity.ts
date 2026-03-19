// types/activity.ts

export type ActivityType = "transit" | "delivered" | "new" | "movement";

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  meta: string;
  time: string;
}
import type { JsonValue } from "./common.types";
import type {
  ActivityType,
  DraftStatus,
  NotificationType,
  Platform,
  PrimaryGoal,
  UserType,
} from "./schema.types";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  emailVerifiedAt: Date | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublicRecord = Omit<UserRecord, "passwordHash">;

export type UserSummary = Pick<
  UserPublicRecord,
  "id" | "email" | "firstName" | "lastName" | "avatarUrl"
>;

export interface UserProfileRecord {
  id: string;
  userId: string;
  userType: UserType | null;
  primaryGoal: PrimaryGoal | null;
  reminderTime: string | null;
  timezone: string | null;
  notificationsEnabled: boolean;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkLogRecord {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  wordCount: number | null;
  generated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkLogSummary = Pick<
  WorkLogRecord,
  | "id"
  | "userId"
  | "title"
  | "wordCount"
  | "generated"
  | "createdAt"
  | "updatedAt"
>;

export interface QuickCaptureRecord {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedPostRecord {
  id: string;
  userId: string;
  workLogId: string | null;
  platform: Platform;
  content: string;
  status: DraftStatus;
  isFavorite: boolean;
  contentDate: Date | null;
  copiedCount: number;
  openedPlatformCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActivityRecord {
  id: string;
  userId: string;
  type: ActivityType;
  metadata: JsonValue | null;
  createdAt: Date;
}

export interface NotificationHistoryRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  delivered: boolean;
  createdAt: Date;
}

export interface UserProfileWithUser extends UserProfileRecord {
  user?: UserSummary | null;
}

export interface WorkLogWithUser extends WorkLogRecord {
  user?: UserSummary | null;
}

export interface WorkLogWithGeneratedPosts extends WorkLogRecord {
  generatedPosts?: GeneratedPostRecord[];
}

export interface GeneratedPostWithUser extends GeneratedPostRecord {
  user?: UserSummary | null;
}

export interface GeneratedPostWithWorkLog extends GeneratedPostRecord {
  workLog?: WorkLogSummary | null;
}

export interface PushSubscriptionWithUser extends PushSubscriptionRecord {
  user?: UserSummary | null;
}

export interface UserActivityWithUser extends UserActivityRecord {
  user?: UserSummary | null;
}

export interface NotificationHistoryWithUser extends NotificationHistoryRecord {
  user?: UserSummary | null;
}

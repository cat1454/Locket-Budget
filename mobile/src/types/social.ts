import type { ExpenseCategoryId } from './domain';

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'removed' | 'blocked';

export type ShareMomentType = 'expense' | 'normal';

export type ShareMomentPrivacyScope = 'private' | 'friends_only';

export type MomentReactionType = 'heart' | 'fire' | 'wow' | 'cheer';

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  pairKey: string;
  status: FriendshipStatus;
  createdAt: string;
  respondedAt: string | null;
  updatedAt: string;
}

export interface ShareMoment {
  id: string;
  ownerUserId: string;
  momentType: ShareMomentType;
  expenseId: string | null;
  imageUri: string;
  thumbnailUri: string | null;
  caption: string;
  privacyScope: ShareMomentPrivacyScope;
  shareAmountPreview: boolean;
  amountSnapshot: number | null;
  categorySnapshot: ExpenseCategoryId | null;
  noteSnapshot: string | null;
  createdAt: string;
  sharedAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MomentReaction {
  id: string;
  momentId: string;
  userId: string;
  reactionType: MomentReactionType;
  createdAt: string;
  updatedAt: string;
}

export interface ShareMomentOwnerPreview {
  id: string;
  displayName: string;
}

export interface ShareMomentReactionCounts {
  heart: number;
  fire: number;
  wow: number;
  cheer: number;
}

export interface ShareMomentFeedItem extends ShareMoment {
  owner: ShareMomentOwnerPreview;
  myReaction: MomentReaction | null;
  reactionCounts: ShareMomentReactionCounts;
}

export interface SendFriendRequestInput {
  addresseeId: string;
}

export interface RespondFriendRequestInput {
  action: 'accept' | 'decline' | 'block';
}

export interface CreateShareMomentInput {
  momentType: ShareMomentType;
  expenseId?: string | null;
  imageUri: string;
  thumbnailUri?: string | null;
  caption?: string;
  privacyScope: ShareMomentPrivacyScope;
  shareAmountPreview?: boolean;
}

export interface UpdateShareMomentInput {
  caption?: string;
  privacyScope?: ShareMomentPrivacyScope;
  shareAmountPreview?: boolean;
}

export interface ReactToMomentInput {
  reactionType: MomentReactionType;
}

export interface PagingMeta {
  nextCursor: string | null;
}

export interface ApiEnvelope<T> {
  data: T;
}

export interface PaginatedApiEnvelope<T> {
  data: T[];
  paging: PagingMeta;
}

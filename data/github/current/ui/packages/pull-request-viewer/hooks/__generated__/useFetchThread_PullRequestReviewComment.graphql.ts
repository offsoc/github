/**
 * @generated SignedSource<<aa71e233c9bb670df02868f0ae3c47c8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type CommentAuthorAssociation = "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER" | "%future added value";
export type PullRequestReviewCommentState = "PENDING" | "SUBMITTED" | "%future added value";
export type PullRequestReviewThreadSubjectType = "FILE" | "LINE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type useFetchThread_PullRequestReviewComment$data = {
  readonly author: {
    readonly avatarUrl: string;
    readonly id: string;
    readonly login: string;
    readonly url: string;
  } | null | undefined;
  readonly authorAssociation: CommentAuthorAssociation;
  readonly body: string;
  readonly bodyHTML: string;
  readonly createdAt: string;
  readonly currentDiffResourcePath: string | null | undefined;
  readonly databaseId: number | null | undefined;
  readonly id: string;
  readonly isHidden: boolean;
  readonly lastUserContentEdit: {
    readonly editor: {
      readonly login: string;
      readonly url: string;
    } | null | undefined;
  } | null | undefined;
  readonly minimizedReason: string | null | undefined;
  readonly publishedAt: string | null | undefined;
  readonly reference: {
    readonly author: {
      readonly login: string;
    } | null | undefined;
    readonly number: number;
  };
  readonly repository: {
    readonly id: string;
    readonly isPrivate: boolean;
    readonly name: string;
    readonly owner: {
      readonly id: string;
      readonly login: string;
      readonly url: string;
    };
  };
  readonly stafftoolsUrl: string | null | undefined;
  readonly state: PullRequestReviewCommentState;
  readonly subjectType: PullRequestReviewThreadSubjectType;
  readonly url: string;
  readonly viewerCanBlockFromOrg: boolean;
  readonly viewerCanDelete: boolean;
  readonly viewerCanMinimize: boolean;
  readonly viewerCanReport: boolean;
  readonly viewerCanReportToMaintainer: boolean;
  readonly viewerCanSeeMinimizeButton: boolean;
  readonly viewerCanSeeUnminimizeButton: boolean;
  readonly viewerCanUnblockFromOrg: boolean;
  readonly viewerCanUpdate: boolean;
  readonly viewerDidAuthor: boolean;
  readonly viewerRelationship: CommentAuthorAssociation;
  readonly " $fragmentSpreads": FragmentRefs<"MarkdownEditHistoryViewer_comment" | "ReactionViewerGroups">;
  readonly " $fragmentType": "useFetchThread_PullRequestReviewComment";
};
export type useFetchThread_PullRequestReviewComment$key = {
  readonly " $data"?: useFetchThread_PullRequestReviewComment$data;
  readonly " $fragmentSpreads": FragmentRefs<"useFetchThread_PullRequestReviewComment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "useFetchThread_PullRequestReviewComment"
};

(node as any).hash = "753cb165a4fad1fddde9b60e36366920";

export default node;

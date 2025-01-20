/**
 * @generated SignedSource<<e0e8482c3b701ceb9f203d0b8daa3042>>
 * @relayHash b8a88600703cb3e88f9090a1e90170ac
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b8a88600703cb3e88f9090a1e90170ac

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentAuthorAssociation = "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER" | "%future added value";
export type DiffLineType = "ADDITION" | "CONTEXT" | "DELETION" | "HUNK" | "INJECTED_CONTEXT" | "%future added value";
export type DiffSide = "LEFT" | "RIGHT" | "%future added value";
export type PullRequestReviewCommentState = "PENDING" | "SUBMITTED" | "%future added value";
export type PullRequestReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING" | "%future added value";
export type PullRequestReviewThreadSubjectType = "FILE" | "LINE" | "%future added value";
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
export type AddPullRequestReviewThreadInput = {
  body: string;
  clientMutationId?: string | null | undefined;
  diffRange?: DiffRange | null | undefined;
  line?: number | null | undefined;
  path: string;
  pullRequestId?: string | null | undefined;
  pullRequestReviewId?: string | null | undefined;
  side?: DiffSide | null | undefined;
  startLine?: number | null | undefined;
  startSide?: DiffSide | null | undefined;
  subjectType?: PullRequestReviewThreadSubjectType | null | undefined;
  submitReview?: boolean | null | undefined;
};
export type DiffRange = {
  baseCommitOid?: any | null | undefined;
  endCommitOid: any;
  startCommitOid: any;
};
export type addPullRequestReviewThreadMutation$variables = {
  connections: ReadonlyArray<string>;
  filePath?: string | null | undefined;
  input: AddPullRequestReviewThreadInput;
};
export type addPullRequestReviewThreadMutation$data = {
  readonly addPullRequestReviewThread: {
    readonly errors: ReadonlyArray<{
      readonly shortMessage: string;
    }>;
    readonly pullRequestThread: {
      readonly __id: string;
      readonly comments: {
        readonly __id: string;
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly id?: string;
            readonly " $fragmentSpreads": FragmentRefs<"useFetchThread_PullRequestReviewComment">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
        readonly totalCount?: number;
      };
      readonly diffSide: DiffSide;
      readonly id: string;
      readonly isOutdated: boolean;
      readonly line: number | null | undefined;
      readonly pullRequest: {
        readonly threads: {
          readonly edges: ReadonlyArray<{
            readonly __typename: "PullRequestThreadEdge";
          } | null | undefined> | null | undefined;
          readonly totalCommentsCount: number;
        };
        readonly viewerPendingReview: {
          readonly comments: {
            readonly totalCount: number;
          };
          readonly id: string;
          readonly " $fragmentSpreads": FragmentRefs<"PullRequestReview_pullRequestReview">;
        } | null | undefined;
        readonly " $fragmentSpreads": FragmentRefs<"OpenCommentsPanelButton_pullRequest">;
      };
      readonly startDiffSide: DiffSide | null | undefined;
      readonly startLine: number | null | undefined;
      readonly viewerCanReply: boolean;
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestMarkers_pullRequestThread" | "ThreadPreview_pullRequestThread">;
    } | null | undefined;
  } | null | undefined;
};
export type addPullRequestReviewThreadMutation$rawResponse = {
  readonly addPullRequestReviewThread: {
    readonly errors: ReadonlyArray<{
      readonly __typename: string;
      readonly shortMessage: string;
    }>;
    readonly pullRequestThread: {
      readonly __id?: string;
      readonly comments: {
        readonly __id?: string;
        readonly edges: ReadonlyArray<{
          readonly cursor: string;
          readonly node: {
            readonly __typename: "PullRequestReviewComment";
            readonly __isComment: "PullRequestReviewComment";
            readonly __isReactable: "PullRequestReviewComment";
            readonly author: {
              readonly __typename: string;
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
            readonly lastEditedAt: string | null | undefined;
            readonly lastUserContentEdit: {
              readonly editor: {
                readonly __typename: string;
                readonly id: string;
                readonly login: string;
                readonly url: string;
              } | null | undefined;
              readonly id: string;
            } | null | undefined;
            readonly minimizedReason: string | null | undefined;
            readonly publishedAt: string | null | undefined;
            readonly reactionGroups: ReadonlyArray<{
              readonly content: ReactionContent;
              readonly reactors: {
                readonly nodes: ReadonlyArray<{
                  readonly __typename: "Bot";
                  readonly __isNode: "Bot";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: "Mannequin";
                  readonly __isNode: "Mannequin";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: "Organization";
                  readonly __isNode: "Organization";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: "User";
                  readonly __isNode: "User";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: string;
                  readonly __isNode: string;
                  readonly id: string;
                } | null | undefined> | null | undefined;
                readonly totalCount: number;
              };
              readonly viewerHasReacted: boolean;
            }> | null | undefined;
            readonly reference: {
              readonly author: {
                readonly __typename: string;
                readonly id: string;
                readonly login: string;
              } | null | undefined;
              readonly id: string;
              readonly number: number;
            };
            readonly repository: {
              readonly id: string;
              readonly isPrivate: boolean;
              readonly name: string;
              readonly owner: {
                readonly __typename: string;
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
            readonly viewerCanReadUserContentEdits: boolean;
            readonly viewerCanReport: boolean;
            readonly viewerCanReportToMaintainer: boolean;
            readonly viewerCanSeeMinimizeButton: boolean;
            readonly viewerCanSeeUnminimizeButton: boolean;
            readonly viewerCanUnblockFromOrg: boolean;
            readonly viewerCanUpdate: boolean;
            readonly viewerDidAuthor: boolean;
            readonly viewerRelationship: CommentAuthorAssociation;
          } | null | undefined;
        } | null | undefined> | null | undefined;
        readonly pageInfo: {
          readonly endCursor: string | null | undefined;
          readonly hasNextPage: boolean;
        };
        readonly totalCount: number;
      };
      readonly diffSide: DiffSide;
      readonly firstComment: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly __isComment: "PullRequestReviewComment";
            readonly __isReactable: "PullRequestReviewComment";
            readonly author: {
              readonly __typename: string;
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
            readonly lastEditedAt: string | null | undefined;
            readonly lastUserContentEdit: {
              readonly editor: {
                readonly __typename: string;
                readonly id: string;
                readonly login: string;
                readonly url: string;
              } | null | undefined;
              readonly id: string;
            } | null | undefined;
            readonly minimizedReason: string | null | undefined;
            readonly publishedAt: string | null | undefined;
            readonly reactionGroups: ReadonlyArray<{
              readonly content: ReactionContent;
              readonly reactors: {
                readonly nodes: ReadonlyArray<{
                  readonly __typename: "Bot";
                  readonly __isNode: "Bot";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: "Mannequin";
                  readonly __isNode: "Mannequin";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: "Organization";
                  readonly __isNode: "Organization";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: "User";
                  readonly __isNode: "User";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: string;
                  readonly __isNode: string;
                  readonly id: string;
                } | null | undefined> | null | undefined;
                readonly totalCount: number;
              };
              readonly viewerHasReacted: boolean;
            }> | null | undefined;
            readonly reference: {
              readonly author: {
                readonly __typename: string;
                readonly id: string;
                readonly login: string;
              } | null | undefined;
              readonly id: string;
              readonly number: number;
            };
            readonly repository: {
              readonly id: string;
              readonly isPrivate: boolean;
              readonly name: string;
              readonly owner: {
                readonly __typename: string;
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
            readonly viewerCanReadUserContentEdits: boolean;
            readonly viewerCanReport: boolean;
            readonly viewerCanReportToMaintainer: boolean;
            readonly viewerCanSeeMinimizeButton: boolean;
            readonly viewerCanSeeUnminimizeButton: boolean;
            readonly viewerCanUnblockFromOrg: boolean;
            readonly viewerCanUpdate: boolean;
            readonly viewerDidAuthor: boolean;
            readonly viewerRelationship: CommentAuthorAssociation;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly id: string;
      readonly isOutdated: boolean;
      readonly isResolved: boolean;
      readonly line: number | null | undefined;
      readonly path: string;
      readonly pathDigest: string;
      readonly pullRequest: {
        readonly allThreads: {
          readonly totalCommentsCount: number;
        };
        readonly id: string;
        readonly number: number;
        readonly repository: {
          readonly id: string;
          readonly name: string;
          readonly owner: {
            readonly __typename: string;
            readonly id: string;
            readonly login: string;
          };
        };
        readonly threads: {
          readonly edges: ReadonlyArray<{
            readonly __typename: "PullRequestThreadEdge";
            readonly cursor: string;
            readonly node: {
              readonly __typename: "PullRequestThread";
              readonly id: string;
            } | null | undefined;
          } | null | undefined> | null | undefined;
          readonly pageInfo: {
            readonly endCursor: string | null | undefined;
            readonly hasNextPage: boolean;
          };
          readonly totalCommentsCount: number;
        };
        readonly viewerPendingReview: {
          readonly __id?: string;
          readonly __isComment: "PullRequestReview";
          readonly __isReactable: "PullRequestReview";
          readonly author: {
            readonly __typename: string;
            readonly __isActor: string;
            readonly avatarUrl: string;
            readonly id: string;
            readonly login: string;
          } | null | undefined;
          readonly authorAssociation: CommentAuthorAssociation;
          readonly bodyHTML: string;
          readonly bodyText: string;
          readonly comments: {
            readonly totalCount: number;
          };
          readonly createdAt: string;
          readonly databaseId: number | null | undefined;
          readonly dismissedReviewState: PullRequestReviewState | null | undefined;
          readonly id: string;
          readonly lastEditedAt: string | null | undefined;
          readonly lastUserContentEdit: {
            readonly editor: {
              readonly __typename: string;
              readonly id: string;
              readonly login: string;
              readonly url: string;
            } | null | undefined;
            readonly id: string;
          } | null | undefined;
          readonly onBehalfOf: {
            readonly edges: ReadonlyArray<{
              readonly node: {
                readonly id: string;
                readonly name: string;
                readonly organization: {
                  readonly id: string;
                  readonly name: string | null | undefined;
                };
                readonly url: string;
              } | null | undefined;
            } | null | undefined> | null | undefined;
          };
          readonly pullRequest: {
            readonly author: {
              readonly __typename: string;
              readonly id: string;
              readonly login: string;
            } | null | undefined;
            readonly id: string;
            readonly number: number;
          };
          readonly pullRequestThreadsAndReplies: {
            readonly edges: ReadonlyArray<{
              readonly cursor: string;
              readonly node: {
                readonly __typename: "PullRequestReviewComment";
                readonly __isComment: "PullRequestReviewComment";
                readonly __isNode: "PullRequestReviewComment";
                readonly __isReactable: "PullRequestReviewComment";
                readonly author: {
                  readonly __typename: string;
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
                readonly lastEditedAt: string | null | undefined;
                readonly lastUserContentEdit: {
                  readonly editor: {
                    readonly __typename: string;
                    readonly id: string;
                    readonly login: string;
                    readonly url: string;
                  } | null | undefined;
                  readonly id: string;
                } | null | undefined;
                readonly minimizedReason: string | null | undefined;
                readonly path: string;
                readonly publishedAt: string | null | undefined;
                readonly pullRequestThread: {
                  readonly id: string;
                  readonly isOutdated: boolean;
                  readonly isResolved: boolean;
                } | null | undefined;
                readonly reactionGroups: ReadonlyArray<{
                  readonly content: ReactionContent;
                  readonly reactors: {
                    readonly nodes: ReadonlyArray<{
                      readonly __typename: "Bot";
                      readonly __isNode: "Bot";
                      readonly id: string;
                      readonly login: string;
                    } | {
                      readonly __typename: "Mannequin";
                      readonly __isNode: "Mannequin";
                      readonly id: string;
                      readonly login: string;
                    } | {
                      readonly __typename: "Organization";
                      readonly __isNode: "Organization";
                      readonly id: string;
                      readonly login: string;
                    } | {
                      readonly __typename: "User";
                      readonly __isNode: "User";
                      readonly id: string;
                      readonly login: string;
                    } | {
                      readonly __typename: string;
                      readonly __isNode: string;
                      readonly id: string;
                    } | null | undefined> | null | undefined;
                    readonly totalCount: number;
                  };
                  readonly viewerHasReacted: boolean;
                }> | null | undefined;
                readonly reference: {
                  readonly author: {
                    readonly __typename: string;
                    readonly id: string;
                    readonly login: string;
                  } | null | undefined;
                  readonly id: string;
                  readonly number: number;
                };
                readonly repository: {
                  readonly id: string;
                  readonly isPrivate: boolean;
                  readonly name: string;
                  readonly owner: {
                    readonly __typename: string;
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
                readonly viewerCanReadUserContentEdits: boolean;
                readonly viewerCanReport: boolean;
                readonly viewerCanReportToMaintainer: boolean;
                readonly viewerCanSeeMinimizeButton: boolean;
                readonly viewerCanSeeUnminimizeButton: boolean;
                readonly viewerCanUnblockFromOrg: boolean;
                readonly viewerCanUpdate: boolean;
                readonly viewerDidAuthor: boolean;
                readonly viewerRelationship: CommentAuthorAssociation;
              } | {
                readonly __typename: "PullRequestThread";
                readonly __isNode: "PullRequestThread";
                readonly comments: {
                  readonly __id?: string;
                  readonly edges: ReadonlyArray<{
                    readonly node: {
                      readonly __isComment: "PullRequestReviewComment";
                      readonly __isReactable: "PullRequestReviewComment";
                      readonly author: {
                        readonly __typename: string;
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
                      readonly lastEditedAt: string | null | undefined;
                      readonly lastUserContentEdit: {
                        readonly editor: {
                          readonly __typename: string;
                          readonly id: string;
                          readonly login: string;
                          readonly url: string;
                        } | null | undefined;
                        readonly id: string;
                      } | null | undefined;
                      readonly minimizedReason: string | null | undefined;
                      readonly publishedAt: string | null | undefined;
                      readonly reactionGroups: ReadonlyArray<{
                        readonly content: ReactionContent;
                        readonly reactors: {
                          readonly nodes: ReadonlyArray<{
                            readonly __typename: "Bot";
                            readonly __isNode: "Bot";
                            readonly id: string;
                            readonly login: string;
                          } | {
                            readonly __typename: "Mannequin";
                            readonly __isNode: "Mannequin";
                            readonly id: string;
                            readonly login: string;
                          } | {
                            readonly __typename: "Organization";
                            readonly __isNode: "Organization";
                            readonly id: string;
                            readonly login: string;
                          } | {
                            readonly __typename: "User";
                            readonly __isNode: "User";
                            readonly id: string;
                            readonly login: string;
                          } | {
                            readonly __typename: string;
                            readonly __isNode: string;
                            readonly id: string;
                          } | null | undefined> | null | undefined;
                          readonly totalCount: number;
                        };
                        readonly viewerHasReacted: boolean;
                      }> | null | undefined;
                      readonly reference: {
                        readonly author: {
                          readonly __typename: string;
                          readonly id: string;
                          readonly login: string;
                        } | null | undefined;
                        readonly id: string;
                        readonly number: number;
                      };
                      readonly repository: {
                        readonly id: string;
                        readonly isPrivate: boolean;
                        readonly name: string;
                        readonly owner: {
                          readonly __typename: string;
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
                      readonly viewerCanReadUserContentEdits: boolean;
                      readonly viewerCanReport: boolean;
                      readonly viewerCanReportToMaintainer: boolean;
                      readonly viewerCanSeeMinimizeButton: boolean;
                      readonly viewerCanSeeUnminimizeButton: boolean;
                      readonly viewerCanUnblockFromOrg: boolean;
                      readonly viewerCanUpdate: boolean;
                      readonly viewerDidAuthor: boolean;
                      readonly viewerRelationship: CommentAuthorAssociation;
                    } | null | undefined;
                  } | null | undefined> | null | undefined;
                  readonly totalCount: number;
                };
                readonly currentDiffResourcePath: string | null | undefined;
                readonly id: string;
                readonly isOutdated: boolean;
                readonly isResolved: boolean;
                readonly line: number | null | undefined;
                readonly path: string;
                readonly subject: {
                  readonly __typename: "PullRequestDiffThread";
                  readonly diffLines: ReadonlyArray<{
                    readonly __id?: string;
                    readonly html: string;
                    readonly left: number | null | undefined;
                    readonly right: number | null | undefined;
                    readonly text: string;
                    readonly type: DiffLineType;
                  } | null | undefined> | null | undefined;
                  readonly endDiffSide: DiffSide;
                  readonly endLine: number | null | undefined;
                  readonly originalEndLine: number | null | undefined;
                  readonly originalStartLine: number | null | undefined;
                  readonly startDiffSide: DiffSide | null | undefined;
                  readonly startLine: number | null | undefined;
                } | {
                  readonly __typename: string;
                };
                readonly subjectType: PullRequestReviewThreadSubjectType;
                readonly viewerCanReply: boolean;
              } | {
                readonly __typename: string;
                readonly __isNode: string;
                readonly id: string;
              } | null | undefined;
            } | null | undefined> | null | undefined;
            readonly pageInfo: {
              readonly endCursor: string | null | undefined;
              readonly hasNextPage: boolean;
            };
          } | null | undefined;
          readonly reactionGroups: ReadonlyArray<{
            readonly content: ReactionContent;
            readonly reactors: {
              readonly nodes: ReadonlyArray<{
                readonly __typename: "Bot";
                readonly __isNode: "Bot";
                readonly id: string;
                readonly login: string;
              } | {
                readonly __typename: "Mannequin";
                readonly __isNode: "Mannequin";
                readonly id: string;
                readonly login: string;
              } | {
                readonly __typename: "Organization";
                readonly __isNode: "Organization";
                readonly id: string;
                readonly login: string;
              } | {
                readonly __typename: "User";
                readonly __isNode: "User";
                readonly id: string;
                readonly login: string;
              } | {
                readonly __typename: string;
                readonly __isNode: string;
                readonly id: string;
              } | null | undefined> | null | undefined;
              readonly totalCount: number;
            };
            readonly viewerHasReacted: boolean;
          }> | null | undefined;
          readonly repository: {
            readonly id: string;
            readonly isPrivate: boolean;
            readonly name: string;
            readonly owner: {
              readonly __typename: string;
              readonly id: string;
              readonly login: string;
              readonly url: string;
            };
          };
          readonly state: PullRequestReviewState;
          readonly url: string;
          readonly viewerCanBlockFromOrg: boolean;
          readonly viewerCanDelete: boolean;
          readonly viewerCanReadUserContentEdits: boolean;
          readonly viewerCanReport: boolean;
          readonly viewerCanReportToMaintainer: boolean;
          readonly viewerCanUnblockFromOrg: boolean;
          readonly viewerCanUpdate: boolean;
        } | null | undefined;
      };
      readonly startDiffSide: DiffSide | null | undefined;
      readonly startLine: number | null | undefined;
      readonly subject: {
        readonly __typename: "PullRequestDiffThread";
        readonly diffLines: ReadonlyArray<{
          readonly __id?: string;
          readonly html: string;
          readonly left: number | null | undefined;
          readonly right: number | null | undefined;
          readonly text: string;
          readonly type: DiffLineType;
        } | null | undefined> | null | undefined;
        readonly endDiffSide: DiffSide;
        readonly originalEndLine: number | null | undefined;
        readonly originalStartLine: number | null | undefined;
        readonly startDiffSide: DiffSide | null | undefined;
      } | {
        readonly __typename: string;
      };
      readonly threadPreviewComments: {
        readonly edges: ReadonlyArray<{
          readonly node: {
            readonly author: {
              readonly __typename: string;
              readonly avatarUrl: string;
              readonly id: string;
              readonly login: string;
            } | null | undefined;
            readonly id: string;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly viewerCanReply: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type addPullRequestReviewThreadMutation = {
  rawResponse: addPullRequestReviewThreadMutation$rawResponse;
  response: addPullRequestReviewThreadMutation$data;
  variables: addPullRequestReviewThreadMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "filePath"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v3 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "diffSide",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "line",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDiffSide",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startLine",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReply",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isResolved",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pathDigest",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v14 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorAssociation",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentDiffResourcePath",
  "storageKey": null
},
v24 = {
  "alias": "isHidden",
  "args": null,
  "kind": "ScalarField",
  "name": "isMinimized",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "minimizedReason",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "publishedAt",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v28 = [
  (v17/*: any*/)
],
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isPrivate",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subjectType",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanBlockFromOrg",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanMinimize",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReport",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReportToMaintainer",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeMinimizeButton",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeUnminimizeButton",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUnblockFromOrg",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerRelationship",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stafftoolsUrl",
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDelete",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "concreteType": "PageInfo",
  "kind": "LinkedField",
  "name": "pageInfo",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endCursor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "hasNextPage",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v48 = {
  "kind": "ClientExtension",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__id",
      "storageKey": null
    }
  ]
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v50 = {
  "kind": "Literal",
  "name": "isPositioned",
  "value": false
},
v51 = {
  "kind": "Variable",
  "name": "path",
  "variableName": "filePath"
},
v52 = {
  "kind": "Literal",
  "name": "subjectType",
  "value": "FILE"
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCommentsCount",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequestReviewCommentConnection",
  "kind": "LinkedField",
  "name": "comments",
  "plural": false,
  "selections": [
    (v49/*: any*/)
  ],
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shortMessage",
  "storageKey": null
},
v56 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "originalStartLine",
  "storageKey": null
},
v57 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "originalEndLine",
  "storageKey": null
},
v58 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "endDiffSide",
  "storageKey": null
},
v59 = {
  "alias": null,
  "args": [
    {
      "kind": "Literal",
      "name": "maxContextLines",
      "value": 3
    }
  ],
  "concreteType": "DiffLine",
  "kind": "LinkedField",
  "name": "diffLines",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "left",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "right",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "html",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "type",
      "storageKey": null
    },
    (v48/*: any*/)
  ],
  "storageKey": "diffLines(maxContextLines:3)"
},
v60 = {
  "kind": "Literal",
  "name": "first",
  "value": 50
},
v61 = [
  (v60/*: any*/)
],
v62 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v45/*: any*/),
    (v16/*: any*/),
    (v4/*: any*/),
    (v17/*: any*/),
    (v18/*: any*/)
  ],
  "storageKey": null
},
v63 = {
  "alias": null,
  "args": null,
  "concreteType": "UserContentEdit",
  "kind": "LinkedField",
  "name": "lastUserContentEdit",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "editor",
      "plural": false,
      "selections": [
        (v45/*: any*/),
        (v17/*: any*/),
        (v18/*: any*/),
        (v4/*: any*/)
      ],
      "storageKey": null
    },
    (v4/*: any*/)
  ],
  "storageKey": null
},
v64 = [
  (v45/*: any*/),
  (v17/*: any*/),
  (v4/*: any*/)
],
v65 = [
  (v27/*: any*/),
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "author",
    "plural": false,
    "selections": (v64/*: any*/),
    "storageKey": null
  },
  (v4/*: any*/)
],
v66 = {
  "alias": "reference",
  "args": null,
  "concreteType": "PullRequest",
  "kind": "LinkedField",
  "name": "pullRequest",
  "plural": false,
  "selections": (v65/*: any*/),
  "storageKey": null
},
v67 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v4/*: any*/),
    (v29/*: any*/),
    (v30/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
        (v45/*: any*/),
        (v4/*: any*/),
        (v17/*: any*/),
        (v18/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v68 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReadUserContentEdits",
  "storageKey": null
},
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastEditedAt",
  "storageKey": null
},
v70 = {
  "kind": "InlineFragment",
  "selections": [
    (v68/*: any*/),
    (v69/*: any*/)
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
},
v71 = {
  "kind": "InlineFragment",
  "selections": [
    (v4/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v72 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ReactionGroup",
      "kind": "LinkedField",
      "name": "reactionGroups",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "content",
          "storageKey": null
        },
        {
          "alias": null,
          "args": [
            {
              "kind": "Literal",
              "name": "first",
              "value": 5
            }
          ],
          "concreteType": "ReactorConnection",
          "kind": "LinkedField",
          "name": "reactors",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": null,
              "kind": "LinkedField",
              "name": "nodes",
              "plural": true,
              "selections": [
                (v45/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": (v28/*: any*/),
                  "type": "User",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v28/*: any*/),
                  "type": "Bot",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v28/*: any*/),
                  "type": "Organization",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v28/*: any*/),
                  "type": "Mannequin",
                  "abstractKey": null
                },
                (v71/*: any*/)
              ],
              "storageKey": null
            },
            (v49/*: any*/)
          ],
          "storageKey": "reactors(first:5)"
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerHasReacted",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Reactable",
  "abstractKey": "__isReactable"
},
v73 = [
  (v60/*: any*/),
  (v50/*: any*/),
  (v51/*: any*/),
  (v52/*: any*/)
],
v74 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "addPullRequestReviewThreadMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "AddPullRequestReviewThreadPayload",
        "kind": "LinkedField",
        "name": "addPullRequestReviewThread",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestThread",
            "kind": "LinkedField",
            "name": "pullRequestThread",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "ThreadPreview_pullRequestThread"
              },
              {
                "kind": "InlineDataFragmentSpread",
                "name": "PullRequestMarkers_pullRequestThread",
                "selections": [
                  (v4/*: any*/),
                  (v11/*: any*/),
                  (v12/*: any*/),
                  (v13/*: any*/),
                  (v7/*: any*/),
                  {
                    "alias": "firstComment",
                    "args": (v14/*: any*/),
                    "concreteType": "PullRequestReviewCommentConnection",
                    "kind": "LinkedField",
                    "name": "comments",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewCommentEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestReviewComment",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v15/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "comments(first:1)"
                  }
                ],
                "args": null,
                "argumentDefinitions": []
              },
              {
                "alias": "comments",
                "args": null,
                "concreteType": "PullRequestReviewCommentConnection",
                "kind": "LinkedField",
                "name": "__ReviewThread_comments_connection",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewCommentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewComment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "InlineDataFragmentSpread",
                            "name": "useFetchThread_PullRequestReviewComment",
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
                                "selections": [
                                  (v16/*: any*/),
                                  (v4/*: any*/),
                                  (v17/*: any*/),
                                  (v18/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v19/*: any*/),
                              (v20/*: any*/),
                              (v21/*: any*/),
                              (v22/*: any*/),
                              (v23/*: any*/),
                              (v15/*: any*/),
                              (v4/*: any*/),
                              (v24/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "UserContentEdit",
                                "kind": "LinkedField",
                                "name": "lastUserContentEdit",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "editor",
                                    "plural": false,
                                    "selections": [
                                      (v17/*: any*/),
                                      (v18/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v25/*: any*/),
                              (v26/*: any*/),
                              {
                                "alias": "reference",
                                "args": null,
                                "concreteType": "PullRequest",
                                "kind": "LinkedField",
                                "name": "pullRequest",
                                "plural": false,
                                "selections": [
                                  (v27/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "author",
                                    "plural": false,
                                    "selections": (v28/*: any*/),
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Repository",
                                "kind": "LinkedField",
                                "name": "repository",
                                "plural": false,
                                "selections": [
                                  (v4/*: any*/),
                                  (v29/*: any*/),
                                  (v30/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "owner",
                                    "plural": false,
                                    "selections": [
                                      (v4/*: any*/),
                                      (v17/*: any*/),
                                      (v18/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v31/*: any*/),
                              (v32/*: any*/),
                              (v33/*: any*/),
                              (v34/*: any*/),
                              (v35/*: any*/),
                              (v36/*: any*/),
                              (v37/*: any*/),
                              (v38/*: any*/),
                              (v39/*: any*/),
                              (v40/*: any*/),
                              (v41/*: any*/),
                              (v42/*: any*/),
                              (v18/*: any*/),
                              (v43/*: any*/),
                              (v44/*: any*/),
                              {
                                "args": null,
                                "kind": "FragmentSpread",
                                "name": "MarkdownEditHistoryViewer_comment"
                              },
                              {
                                "args": null,
                                "kind": "FragmentSpread",
                                "name": "ReactionViewerGroups"
                              }
                            ],
                            "args": null,
                            "argumentDefinitions": []
                          },
                          (v45/*: any*/),
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v46/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v47/*: any*/),
                  (v48/*: any*/),
                  (v49/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": [
                  {
                    "alias": "threads",
                    "args": [
                      (v50/*: any*/),
                      (v51/*: any*/),
                      (v52/*: any*/)
                    ],
                    "concreteType": "PullRequestThreadConnection",
                    "kind": "LinkedField",
                    "name": "__SingleFileViewConversation_threads_connection",
                    "plural": false,
                    "selections": [
                      (v53/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestThreadEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          (v45/*: any*/),
                          (v46/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestThread",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v45/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v47/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "OpenCommentsPanelButton_pullRequest"
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReview",
                    "kind": "LinkedField",
                    "name": "viewerPendingReview",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      {
                        "args": null,
                        "kind": "FragmentSpread",
                        "name": "PullRequestReview_pullRequestReview"
                      },
                      (v54/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v48/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v55/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "addPullRequestReviewThreadMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "AddPullRequestReviewThreadPayload",
        "kind": "LinkedField",
        "name": "addPullRequestReviewThread",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestThread",
            "kind": "LinkedField",
            "name": "pullRequestThread",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/),
              (v6/*: any*/),
              (v7/*: any*/),
              (v8/*: any*/),
              (v9/*: any*/),
              (v10/*: any*/),
              (v11/*: any*/),
              (v13/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "subject",
                "plural": false,
                "selections": [
                  (v45/*: any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      (v56/*: any*/),
                      (v57/*: any*/),
                      (v8/*: any*/),
                      (v58/*: any*/),
                      (v59/*: any*/)
                    ],
                    "type": "PullRequestDiffThread",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": "threadPreviewComments",
                "args": (v61/*: any*/),
                "concreteType": "PullRequestReviewCommentConnection",
                "kind": "LinkedField",
                "name": "comments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewCommentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewComment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "author",
                            "plural": false,
                            "selections": [
                              (v45/*: any*/),
                              (v17/*: any*/),
                              (v16/*: any*/),
                              (v4/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "comments(first:50)"
              },
              {
                "alias": "firstComment",
                "args": (v14/*: any*/),
                "concreteType": "PullRequestReviewCommentConnection",
                "kind": "LinkedField",
                "name": "comments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewCommentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewComment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          (v62/*: any*/),
                          (v19/*: any*/),
                          (v20/*: any*/),
                          (v21/*: any*/),
                          (v22/*: any*/),
                          (v23/*: any*/),
                          (v15/*: any*/),
                          (v24/*: any*/),
                          (v63/*: any*/),
                          (v25/*: any*/),
                          (v26/*: any*/),
                          (v66/*: any*/),
                          (v67/*: any*/),
                          (v31/*: any*/),
                          (v32/*: any*/),
                          (v33/*: any*/),
                          (v34/*: any*/),
                          (v35/*: any*/),
                          (v36/*: any*/),
                          (v37/*: any*/),
                          (v38/*: any*/),
                          (v39/*: any*/),
                          (v40/*: any*/),
                          (v41/*: any*/),
                          (v42/*: any*/),
                          (v18/*: any*/),
                          (v43/*: any*/),
                          (v44/*: any*/),
                          (v70/*: any*/),
                          (v72/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "comments(first:1)"
              },
              (v12/*: any*/),
              {
                "alias": null,
                "args": (v61/*: any*/),
                "concreteType": "PullRequestReviewCommentConnection",
                "kind": "LinkedField",
                "name": "comments",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReviewCommentEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewComment",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v62/*: any*/),
                          (v19/*: any*/),
                          (v20/*: any*/),
                          (v21/*: any*/),
                          (v22/*: any*/),
                          (v23/*: any*/),
                          (v15/*: any*/),
                          (v4/*: any*/),
                          (v24/*: any*/),
                          (v63/*: any*/),
                          (v25/*: any*/),
                          (v26/*: any*/),
                          (v66/*: any*/),
                          (v67/*: any*/),
                          (v31/*: any*/),
                          (v32/*: any*/),
                          (v33/*: any*/),
                          (v34/*: any*/),
                          (v35/*: any*/),
                          (v36/*: any*/),
                          (v37/*: any*/),
                          (v38/*: any*/),
                          (v39/*: any*/),
                          (v40/*: any*/),
                          (v41/*: any*/),
                          (v42/*: any*/),
                          (v18/*: any*/),
                          (v43/*: any*/),
                          (v44/*: any*/),
                          (v45/*: any*/),
                          (v70/*: any*/),
                          (v72/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v46/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v47/*: any*/),
                  (v49/*: any*/),
                  (v48/*: any*/)
                ],
                "storageKey": "comments(first:50)"
              },
              {
                "alias": null,
                "args": (v61/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "ReviewThread_comments",
                "kind": "LinkedHandle",
                "name": "comments"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v73/*: any*/),
                    "concreteType": "PullRequestThreadConnection",
                    "kind": "LinkedField",
                    "name": "threads",
                    "plural": false,
                    "selections": [
                      (v53/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestThreadEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          (v45/*: any*/),
                          (v46/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestThread",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v45/*: any*/),
                              (v4/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v47/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": (v73/*: any*/),
                    "filters": [
                      "isPositioned",
                      "subjectType",
                      "path"
                    ],
                    "handle": "connection",
                    "key": "SingleFileViewConversation_threads",
                    "kind": "LinkedHandle",
                    "name": "threads"
                  },
                  {
                    "alias": "allThreads",
                    "args": [
                      (v60/*: any*/),
                      (v50/*: any*/)
                    ],
                    "concreteType": "PullRequestThreadConnection",
                    "kind": "LinkedField",
                    "name": "threads",
                    "plural": false,
                    "selections": [
                      (v53/*: any*/)
                    ],
                    "storageKey": "threads(first:50,isPositioned:false)"
                  },
                  (v27/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "repository",
                    "plural": false,
                    "selections": [
                      (v30/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "owner",
                        "plural": false,
                        "selections": (v64/*: any*/),
                        "storageKey": null
                      },
                      (v4/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestReview",
                    "kind": "LinkedField",
                    "name": "viewerPendingReview",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      (v15/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "author",
                        "plural": false,
                        "selections": [
                          (v45/*: any*/),
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": [
                              {
                                "kind": "Literal",
                                "name": "size",
                                "value": 64
                              }
                            ],
                            "kind": "ScalarField",
                            "name": "avatarUrl",
                            "storageKey": "avatarUrl(size:64)"
                          },
                          (v17/*: any*/),
                          {
                            "kind": "TypeDiscriminator",
                            "abstractKey": "__isActor"
                          }
                        ],
                        "storageKey": null
                      },
                      (v19/*: any*/),
                      (v20/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "bodyText",
                        "storageKey": null
                      },
                      (v22/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequest",
                        "kind": "LinkedField",
                        "name": "pullRequest",
                        "plural": false,
                        "selections": (v65/*: any*/),
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 10
                          }
                        ],
                        "concreteType": "TeamConnection",
                        "kind": "LinkedField",
                        "name": "onBehalfOf",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "TeamEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Team",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "Organization",
                                    "kind": "LinkedField",
                                    "name": "organization",
                                    "plural": false,
                                    "selections": [
                                      (v30/*: any*/),
                                      (v4/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  (v30/*: any*/),
                                  (v18/*: any*/),
                                  (v4/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "onBehalfOf(first:10)"
                      },
                      (v67/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "dismissedReviewState",
                        "storageKey": null
                      },
                      (v31/*: any*/),
                      (v18/*: any*/),
                      (v43/*: any*/),
                      (v44/*: any*/),
                      (v36/*: any*/),
                      (v37/*: any*/),
                      (v34/*: any*/),
                      (v40/*: any*/),
                      {
                        "alias": null,
                        "args": (v74/*: any*/),
                        "concreteType": "PullRequestReviewCommentItemConnection",
                        "kind": "LinkedField",
                        "name": "pullRequestThreadsAndReplies",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestReviewCommentItemEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  (v45/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v4/*: any*/),
                                      (v6/*: any*/),
                                      (v11/*: any*/),
                                      (v7/*: any*/),
                                      (v13/*: any*/),
                                      (v23/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": null,
                                        "kind": "LinkedField",
                                        "name": "subject",
                                        "plural": false,
                                        "selections": [
                                          (v45/*: any*/),
                                          {
                                            "kind": "InlineFragment",
                                            "selections": [
                                              (v56/*: any*/),
                                              (v57/*: any*/),
                                              (v9/*: any*/),
                                              {
                                                "alias": null,
                                                "args": null,
                                                "kind": "ScalarField",
                                                "name": "endLine",
                                                "storageKey": null
                                              },
                                              (v8/*: any*/),
                                              (v58/*: any*/),
                                              (v59/*: any*/)
                                            ],
                                            "type": "PullRequestDiffThread",
                                            "abstractKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      },
                                      (v32/*: any*/),
                                      (v10/*: any*/),
                                      {
                                        "alias": null,
                                        "args": (v61/*: any*/),
                                        "concreteType": "PullRequestReviewCommentConnection",
                                        "kind": "LinkedField",
                                        "name": "comments",
                                        "plural": false,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "PullRequestReviewCommentEdge",
                                            "kind": "LinkedField",
                                            "name": "edges",
                                            "plural": true,
                                            "selections": [
                                              {
                                                "alias": null,
                                                "args": null,
                                                "concreteType": "PullRequestReviewComment",
                                                "kind": "LinkedField",
                                                "name": "node",
                                                "plural": false,
                                                "selections": [
                                                  (v62/*: any*/),
                                                  (v19/*: any*/),
                                                  (v20/*: any*/),
                                                  (v21/*: any*/),
                                                  (v22/*: any*/),
                                                  (v23/*: any*/),
                                                  (v15/*: any*/),
                                                  (v4/*: any*/),
                                                  (v24/*: any*/),
                                                  (v63/*: any*/),
                                                  (v25/*: any*/),
                                                  (v26/*: any*/),
                                                  (v66/*: any*/),
                                                  (v67/*: any*/),
                                                  (v31/*: any*/),
                                                  (v32/*: any*/),
                                                  (v33/*: any*/),
                                                  (v34/*: any*/),
                                                  (v35/*: any*/),
                                                  (v36/*: any*/),
                                                  (v37/*: any*/),
                                                  (v38/*: any*/),
                                                  (v39/*: any*/),
                                                  (v40/*: any*/),
                                                  (v41/*: any*/),
                                                  (v42/*: any*/),
                                                  (v18/*: any*/),
                                                  (v43/*: any*/),
                                                  (v44/*: any*/),
                                                  (v70/*: any*/),
                                                  (v72/*: any*/)
                                                ],
                                                "storageKey": null
                                              }
                                            ],
                                            "storageKey": null
                                          },
                                          (v49/*: any*/),
                                          (v48/*: any*/)
                                        ],
                                        "storageKey": "comments(first:50)"
                                      }
                                    ],
                                    "type": "PullRequestThread",
                                    "abstractKey": null
                                  },
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      (v4/*: any*/),
                                      (v23/*: any*/),
                                      (v13/*: any*/),
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "PullRequestThread",
                                        "kind": "LinkedField",
                                        "name": "pullRequestThread",
                                        "plural": false,
                                        "selections": [
                                          (v4/*: any*/),
                                          (v6/*: any*/),
                                          (v11/*: any*/)
                                        ],
                                        "storageKey": null
                                      },
                                      (v62/*: any*/),
                                      (v19/*: any*/),
                                      (v20/*: any*/),
                                      (v21/*: any*/),
                                      (v22/*: any*/),
                                      (v15/*: any*/),
                                      (v24/*: any*/),
                                      (v63/*: any*/),
                                      (v25/*: any*/),
                                      (v26/*: any*/),
                                      (v66/*: any*/),
                                      (v67/*: any*/),
                                      (v31/*: any*/),
                                      (v32/*: any*/),
                                      (v33/*: any*/),
                                      (v34/*: any*/),
                                      (v35/*: any*/),
                                      (v36/*: any*/),
                                      (v37/*: any*/),
                                      (v38/*: any*/),
                                      (v39/*: any*/),
                                      (v40/*: any*/),
                                      (v41/*: any*/),
                                      (v42/*: any*/),
                                      (v18/*: any*/),
                                      (v43/*: any*/),
                                      (v44/*: any*/),
                                      (v72/*: any*/),
                                      (v70/*: any*/)
                                    ],
                                    "type": "PullRequestReviewComment",
                                    "abstractKey": null
                                  },
                                  (v71/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v46/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v47/*: any*/)
                        ],
                        "storageKey": "pullRequestThreadsAndReplies(first:100)"
                      },
                      {
                        "alias": null,
                        "args": (v74/*: any*/),
                        "filters": null,
                        "handle": "connection",
                        "key": "PullRequestReview_pullRequestThreadsAndReplies",
                        "kind": "LinkedHandle",
                        "name": "pullRequestThreadsAndReplies"
                      },
                      (v54/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v68/*: any*/),
                          (v69/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "UserContentEdit",
                            "kind": "LinkedField",
                            "name": "lastUserContentEdit",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "editor",
                                "plural": false,
                                "selections": [
                                  (v45/*: any*/),
                                  (v18/*: any*/),
                                  (v17/*: any*/),
                                  (v4/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v4/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "type": "Comment",
                        "abstractKey": "__isComment"
                      },
                      (v72/*: any*/),
                      (v48/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              (v48/*: any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendNode",
            "key": "",
            "kind": "LinkedHandle",
            "name": "pullRequestThread",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              },
              {
                "kind": "Literal",
                "name": "edgeTypeName",
                "value": "PullRequestReviewThreadEdge"
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "errors",
            "plural": true,
            "selections": [
              (v45/*: any*/),
              (v55/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "b8a88600703cb3e88f9090a1e90170ac",
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "addPullRequestReviewThread",
            "pullRequestThread",
            "comments"
          ]
        },
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "addPullRequestReviewThread",
            "pullRequestThread",
            "pullRequest",
            "threads"
          ]
        }
      ]
    },
    "name": "addPullRequestReviewThreadMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "469501a32d6f07fc049e6d43bbab618b";

export default node;

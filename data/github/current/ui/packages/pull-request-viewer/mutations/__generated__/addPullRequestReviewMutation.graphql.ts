/**
 * @generated SignedSource<<e81fe60bdf2ae2ce6089a6daf97c181c>>
 * @relayHash a964c4b06cb9132c7bf9b2d0addbf574
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID a964c4b06cb9132c7bf9b2d0addbf574

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentAuthorAssociation = "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER" | "%future added value";
export type DiffLineType = "ADDITION" | "CONTEXT" | "DELETION" | "HUNK" | "INJECTED_CONTEXT" | "%future added value";
export type DiffSide = "LEFT" | "RIGHT" | "%future added value";
export type PullRequestReviewCommentState = "PENDING" | "SUBMITTED" | "%future added value";
export type PullRequestReviewEvent = "APPROVE" | "COMMENT" | "DISMISS" | "REQUEST_CHANGES" | "%future added value";
export type PullRequestReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING" | "%future added value";
export type PullRequestReviewThreadSubjectType = "FILE" | "LINE" | "%future added value";
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
export type AddPullRequestReviewInput = {
  body?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  comments?: ReadonlyArray<DraftPullRequestReviewComment | null | undefined> | null | undefined;
  commitOID?: any | null | undefined;
  event?: PullRequestReviewEvent | null | undefined;
  pullRequestId: string;
  threads?: ReadonlyArray<DraftPullRequestReviewThread | null | undefined> | null | undefined;
};
export type DraftPullRequestReviewComment = {
  body: string;
  path: string;
  position: number;
};
export type DraftPullRequestReviewThread = {
  body: string;
  line: number;
  path: string;
  side?: DiffSide | null | undefined;
  startLine?: number | null | undefined;
  startSide?: DiffSide | null | undefined;
};
export type addPullRequestReviewMutation$variables = {
  input: AddPullRequestReviewInput;
};
export type addPullRequestReviewMutation$data = {
  readonly addPullRequestReview: {
    readonly pullRequestReview: {
      readonly pullRequest: {
        readonly latestReviews: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly author: {
                readonly avatarUrl: string;
                readonly login: string;
                readonly name: string | null | undefined;
                readonly url: string;
              } | null | undefined;
              readonly authorCanPushToRepository: boolean;
              readonly onBehalfOf: {
                readonly edges: ReadonlyArray<{
                  readonly node: {
                    readonly name: string;
                  } | null | undefined;
                } | null | undefined> | null | undefined;
              };
              readonly onBehalfOfReviewers: ReadonlyArray<{
                readonly asCodeowner: boolean;
                readonly reviewer: {
                  readonly __typename: "Team";
                  readonly combinedSlug: string;
                } | {
                  readonly __typename: "User";
                  readonly login: string;
                } | {
                  // This will never be '%other', but we need some
                  // value in case none of the concrete values match.
                  readonly __typename: "%other";
                } | null | undefined;
              }>;
              readonly state: PullRequestReviewState;
            } | null | undefined;
          } | null | undefined> | null | undefined;
        } | null | undefined;
      };
      readonly url: string;
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestReview_pullRequestReview">;
    } | null | undefined;
  } | null | undefined;
};
export type addPullRequestReviewMutation$rawResponse = {
  readonly addPullRequestReview: {
    readonly pullRequestReview: {
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
        readonly latestReviews: {
          readonly edges: ReadonlyArray<{
            readonly node: {
              readonly author: {
                readonly __typename: string;
                readonly avatarUrl: string;
                readonly id: string;
                readonly login: string;
                readonly name: string | null | undefined;
                readonly url: string;
              } | null | undefined;
              readonly authorCanPushToRepository: boolean;
              readonly id: string;
              readonly onBehalfOf: {
                readonly edges: ReadonlyArray<{
                  readonly node: {
                    readonly id: string;
                    readonly name: string;
                  } | null | undefined;
                } | null | undefined> | null | undefined;
              };
              readonly onBehalfOfReviewers: ReadonlyArray<{
                readonly asCodeowner: boolean;
                readonly reviewer: {
                  readonly __typename: "Team";
                  readonly __isNode: "Team";
                  readonly combinedSlug: string;
                  readonly id: string;
                } | {
                  readonly __typename: "User";
                  readonly __isNode: "User";
                  readonly id: string;
                  readonly login: string;
                } | {
                  readonly __typename: string;
                  readonly __isNode: string;
                  readonly id: string;
                } | null | undefined;
              }>;
              readonly state: PullRequestReviewState;
            } | null | undefined;
          } | null | undefined> | null | undefined;
        } | null | undefined;
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
  } | null | undefined;
};
export type addPullRequestReviewMutation = {
  rawResponse: addPullRequestReviewMutation$rawResponse;
  response: addPullRequestReviewMutation$data;
  variables: addPullRequestReviewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorCanPushToRepository",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v8 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "asCodeowner",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "combinedSlug",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "authorAssociation",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v10/*: any*/),
    (v5/*: any*/),
    (v13/*: any*/)
  ],
  "storageKey": null
},
v20 = [
  (v7/*: any*/),
  (v13/*: any*/)
],
v21 = [
  (v5/*: any*/)
],
v22 = {
  "kind": "InlineFragment",
  "selections": (v21/*: any*/),
  "type": "User",
  "abstractKey": null
},
v23 = {
  "kind": "InlineFragment",
  "selections": [
    (v13/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v24 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v13/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPrivate",
      "storageKey": null
    },
    (v7/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
        (v10/*: any*/),
        (v13/*: any*/),
        (v5/*: any*/),
        (v2/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDelete",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReport",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReportToMaintainer",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanBlockFromOrg",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUnblockFromOrg",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isResolved",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentDiffResourcePath",
  "storageKey": null
},
v35 = {
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
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subjectType",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v10/*: any*/),
    (v6/*: any*/),
    (v13/*: any*/),
    (v5/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v39 = {
  "alias": "isHidden",
  "args": null,
  "kind": "ScalarField",
  "name": "isMinimized",
  "storageKey": null
},
v40 = {
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
        (v10/*: any*/),
        (v5/*: any*/),
        (v2/*: any*/),
        (v13/*: any*/)
      ],
      "storageKey": null
    },
    (v13/*: any*/)
  ],
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "minimizedReason",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "publishedAt",
  "storageKey": null
},
v43 = {
  "alias": "reference",
  "args": null,
  "concreteType": "PullRequest",
  "kind": "LinkedField",
  "name": "pullRequest",
  "plural": false,
  "selections": [
    (v18/*: any*/),
    (v19/*: any*/),
    (v13/*: any*/)
  ],
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanMinimize",
  "storageKey": null
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeMinimizeButton",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeUnminimizeButton",
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerRelationship",
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stafftoolsUrl",
  "storageKey": null
},
v50 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReadUserContentEdits",
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastEditedAt",
  "storageKey": null
},
v52 = {
  "kind": "InlineFragment",
  "selections": [
    (v50/*: any*/),
    (v51/*: any*/)
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v54 = {
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
                (v10/*: any*/),
                (v22/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": (v21/*: any*/),
                  "type": "Bot",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v21/*: any*/),
                  "type": "Organization",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v21/*: any*/),
                  "type": "Mannequin",
                  "abstractKey": null
                },
                (v23/*: any*/)
              ],
              "storageKey": null
            },
            (v53/*: any*/)
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "addPullRequestReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddPullRequestReviewPayload",
        "kind": "LinkedField",
        "name": "addPullRequestReview",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestReview",
            "kind": "LinkedField",
            "name": "pullRequestReview",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "PullRequestReview_pullRequestReview"
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
                    "args": (v3/*: any*/),
                    "concreteType": "PullRequestReviewConnection",
                    "kind": "LinkedField",
                    "name": "latestReviews",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestReview",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v4/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
                                "selections": [
                                  (v5/*: any*/),
                                  (v6/*: any*/),
                                  (v7/*: any*/),
                                  (v2/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": (v8/*: any*/),
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
                                          (v7/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": "onBehalfOf(first:10)"
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "OnBehalfOfReviewer",
                                "kind": "LinkedField",
                                "name": "onBehalfOfReviewers",
                                "plural": true,
                                "selections": [
                                  (v9/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "reviewer",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          (v10/*: any*/),
                                          (v11/*: any*/)
                                        ],
                                        "type": "Team",
                                        "abstractKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          (v10/*: any*/),
                                          (v5/*: any*/)
                                        ],
                                        "type": "User",
                                        "abstractKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v12/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "latestReviews(first:100)"
                  }
                ],
                "storageKey": null
              }
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "addPullRequestReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddPullRequestReviewPayload",
        "kind": "LinkedField",
        "name": "addPullRequestReview",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequestReview",
            "kind": "LinkedField",
            "name": "pullRequestReview",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v13/*: any*/),
              (v14/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v10/*: any*/),
                  (v13/*: any*/),
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
                  (v5/*: any*/),
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isActor"
                  }
                ],
                "storageKey": null
              },
              (v15/*: any*/),
              (v16/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bodyText",
                "storageKey": null
              },
              (v17/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": [
                  (v18/*: any*/),
                  (v19/*: any*/),
                  (v13/*: any*/),
                  {
                    "alias": null,
                    "args": (v3/*: any*/),
                    "concreteType": "PullRequestReviewConnection",
                    "kind": "LinkedField",
                    "name": "latestReviews",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestReviewEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "PullRequestReview",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v4/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
                                "selections": [
                                  (v10/*: any*/),
                                  (v5/*: any*/),
                                  (v6/*: any*/),
                                  (v7/*: any*/),
                                  (v2/*: any*/),
                                  (v13/*: any*/)
                                ],
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": (v8/*: any*/),
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
                                        "selections": (v20/*: any*/),
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": "onBehalfOf(first:10)"
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "OnBehalfOfReviewer",
                                "kind": "LinkedField",
                                "name": "onBehalfOfReviewers",
                                "plural": true,
                                "selections": [
                                  (v9/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "reviewer",
                                    "plural": false,
                                    "selections": [
                                      (v10/*: any*/),
                                      {
                                        "kind": "InlineFragment",
                                        "selections": [
                                          (v11/*: any*/)
                                        ],
                                        "type": "Team",
                                        "abstractKey": null
                                      },
                                      (v22/*: any*/),
                                      (v23/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v12/*: any*/),
                              (v13/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": "latestReviews(first:100)"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v8/*: any*/),
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
                            "selections": (v20/*: any*/),
                            "storageKey": null
                          },
                          (v7/*: any*/),
                          (v2/*: any*/),
                          (v13/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "onBehalfOf(first:10)"
              },
              (v24/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dismissedReviewState",
                "storageKey": null
              },
              (v12/*: any*/),
              (v25/*: any*/),
              (v26/*: any*/),
              (v27/*: any*/),
              (v28/*: any*/),
              (v29/*: any*/),
              (v30/*: any*/),
              {
                "alias": null,
                "args": (v3/*: any*/),
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
                          (v10/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v13/*: any*/),
                              (v31/*: any*/),
                              (v32/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "line",
                                "storageKey": null
                              },
                              (v33/*: any*/),
                              (v34/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "subject",
                                "plural": false,
                                "selections": [
                                  (v10/*: any*/),
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "originalStartLine",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "originalEndLine",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "startLine",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "endLine",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "startDiffSide",
                                        "storageKey": null
                                      },
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "endDiffSide",
                                        "storageKey": null
                                      },
                                      {
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
                                          (v35/*: any*/)
                                        ],
                                        "storageKey": "diffLines(maxContextLines:3)"
                                      }
                                    ],
                                    "type": "PullRequestDiffThread",
                                    "abstractKey": null
                                  }
                                ],
                                "storageKey": null
                              },
                              (v36/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanReply",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": [
                                  {
                                    "kind": "Literal",
                                    "name": "first",
                                    "value": 50
                                  }
                                ],
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
                                          (v37/*: any*/),
                                          (v15/*: any*/),
                                          (v16/*: any*/),
                                          (v38/*: any*/),
                                          (v17/*: any*/),
                                          (v34/*: any*/),
                                          (v14/*: any*/),
                                          (v13/*: any*/),
                                          (v39/*: any*/),
                                          (v40/*: any*/),
                                          (v41/*: any*/),
                                          (v42/*: any*/),
                                          (v43/*: any*/),
                                          (v24/*: any*/),
                                          (v12/*: any*/),
                                          (v36/*: any*/),
                                          (v44/*: any*/),
                                          (v29/*: any*/),
                                          (v45/*: any*/),
                                          (v27/*: any*/),
                                          (v28/*: any*/),
                                          (v46/*: any*/),
                                          (v47/*: any*/),
                                          (v30/*: any*/),
                                          (v48/*: any*/),
                                          (v49/*: any*/),
                                          (v2/*: any*/),
                                          (v25/*: any*/),
                                          (v26/*: any*/),
                                          (v52/*: any*/),
                                          (v54/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v53/*: any*/),
                                  (v35/*: any*/)
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
                              (v13/*: any*/),
                              (v34/*: any*/),
                              (v33/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PullRequestThread",
                                "kind": "LinkedField",
                                "name": "pullRequestThread",
                                "plural": false,
                                "selections": [
                                  (v13/*: any*/),
                                  (v31/*: any*/),
                                  (v32/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v37/*: any*/),
                              (v15/*: any*/),
                              (v16/*: any*/),
                              (v38/*: any*/),
                              (v17/*: any*/),
                              (v14/*: any*/),
                              (v39/*: any*/),
                              (v40/*: any*/),
                              (v41/*: any*/),
                              (v42/*: any*/),
                              (v43/*: any*/),
                              (v24/*: any*/),
                              (v12/*: any*/),
                              (v36/*: any*/),
                              (v44/*: any*/),
                              (v29/*: any*/),
                              (v45/*: any*/),
                              (v27/*: any*/),
                              (v28/*: any*/),
                              (v46/*: any*/),
                              (v47/*: any*/),
                              (v30/*: any*/),
                              (v48/*: any*/),
                              (v49/*: any*/),
                              (v2/*: any*/),
                              (v25/*: any*/),
                              (v26/*: any*/),
                              (v54/*: any*/),
                              (v52/*: any*/)
                            ],
                            "type": "PullRequestReviewComment",
                            "abstractKey": null
                          },
                          (v23/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "cursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
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
                  }
                ],
                "storageKey": "pullRequestThreadsAndReplies(first:100)"
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "PullRequestReview_pullRequestThreadsAndReplies",
                "kind": "LinkedHandle",
                "name": "pullRequestThreadsAndReplies"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v50/*: any*/),
                  (v51/*: any*/),
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
                          (v10/*: any*/),
                          (v2/*: any*/),
                          (v5/*: any*/),
                          (v13/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v13/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Comment",
                "abstractKey": "__isComment"
              },
              (v54/*: any*/),
              (v35/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "a964c4b06cb9132c7bf9b2d0addbf574",
    "metadata": {},
    "name": "addPullRequestReviewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "6588b9b70f6d071506d338e77443cb1e";

export default node;

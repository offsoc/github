/**
 * @generated SignedSource<<0fff02fca3a5fb0c56c7a1d49c407586>>
 * @relayHash 381500769f5dd363cf0ad8313169a8b6
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 381500769f5dd363cf0ad8313169a8b6

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentAuthorAssociation = "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER" | "%future added value";
export type DiffLineType = "ADDITION" | "CONTEXT" | "DELETION" | "HUNK" | "INJECTED_CONTEXT" | "%future added value";
export type DiffSide = "LEFT" | "RIGHT" | "%future added value";
export type PullRequestReviewCommentState = "PENDING" | "SUBMITTED" | "%future added value";
export type PullRequestReviewState = "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED" | "DISMISSED" | "PENDING" | "%future added value";
export type PullRequestReviewThreadSubjectType = "FILE" | "LINE" | "%future added value";
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
export type UpdatePullRequestReviewInput = {
  body: string;
  clientMutationId?: string | null | undefined;
  pullRequestReviewId: string;
};
export type updatePullRequestReviewMutation$variables = {
  input: UpdatePullRequestReviewInput;
};
export type updatePullRequestReviewMutation$data = {
  readonly updatePullRequestReview: {
    readonly pullRequestReview: {
      readonly " $fragmentSpreads": FragmentRefs<"PullRequestReview_pullRequestReview">;
    } | null | undefined;
  } | null | undefined;
};
export type updatePullRequestReviewMutation$rawResponse = {
  readonly updatePullRequestReview: {
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
export type updatePullRequestReviewMutation = {
  rawResponse: updatePullRequestReviewMutation$rawResponse;
  response: updatePullRequestReviewMutation$data;
  variables: updatePullRequestReviewMutation$variables;
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
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
  "name": "authorAssociation",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bodyHTML",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v9 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "number",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": null,
    "kind": "LinkedField",
    "name": "author",
    "plural": false,
    "selections": [
      (v4/*: any*/),
      (v5/*: any*/),
      (v2/*: any*/)
    ],
    "storageKey": null
  },
  (v2/*: any*/)
],
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPrivate",
      "storageKey": null
    },
    (v10/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
        (v4/*: any*/),
        (v2/*: any*/),
        (v5/*: any*/),
        (v11/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "state",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanDelete",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUpdate",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReport",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReportToMaintainer",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanBlockFromOrg",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanUnblockFromOrg",
  "storageKey": null
},
v20 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 100
  }
],
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isOutdated",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "isResolved",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "path",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentDiffResourcePath",
  "storageKey": null
},
v25 = {
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
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subjectType",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "author",
  "plural": false,
  "selections": [
    (v4/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": null
    },
    (v2/*: any*/),
    (v5/*: any*/),
    (v11/*: any*/)
  ],
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v29 = {
  "alias": "isHidden",
  "args": null,
  "kind": "ScalarField",
  "name": "isMinimized",
  "storageKey": null
},
v30 = {
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
        (v4/*: any*/),
        (v5/*: any*/),
        (v11/*: any*/),
        (v2/*: any*/)
      ],
      "storageKey": null
    },
    (v2/*: any*/)
  ],
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "minimizedReason",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "publishedAt",
  "storageKey": null
},
v33 = {
  "alias": "reference",
  "args": null,
  "concreteType": "PullRequest",
  "kind": "LinkedField",
  "name": "pullRequest",
  "plural": false,
  "selections": (v9/*: any*/),
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerDidAuthor",
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
  "name": "viewerCanSeeMinimizeButton",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanSeeUnminimizeButton",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerRelationship",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "stafftoolsUrl",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerCanReadUserContentEdits",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastEditedAt",
  "storageKey": null
},
v42 = {
  "kind": "InlineFragment",
  "selections": [
    (v40/*: any*/),
    (v41/*: any*/)
  ],
  "type": "Comment",
  "abstractKey": "__isComment"
},
v43 = [
  (v5/*: any*/)
],
v44 = {
  "kind": "InlineFragment",
  "selections": [
    (v2/*: any*/)
  ],
  "type": "Node",
  "abstractKey": "__isNode"
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "totalCount",
  "storageKey": null
},
v46 = {
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
                (v4/*: any*/),
                {
                  "kind": "InlineFragment",
                  "selections": (v43/*: any*/),
                  "type": "User",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v43/*: any*/),
                  "type": "Bot",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v43/*: any*/),
                  "type": "Organization",
                  "abstractKey": null
                },
                {
                  "kind": "InlineFragment",
                  "selections": (v43/*: any*/),
                  "type": "Mannequin",
                  "abstractKey": null
                },
                (v44/*: any*/)
              ],
              "storageKey": null
            },
            (v45/*: any*/)
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
    "name": "updatePullRequestReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePullRequestReviewPayload",
        "kind": "LinkedField",
        "name": "updatePullRequestReview",
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
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "PullRequestReview_pullRequestReview"
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
    "name": "updatePullRequestReviewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePullRequestReviewPayload",
        "kind": "LinkedField",
        "name": "updatePullRequestReview",
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
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v2/*: any*/),
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
              (v6/*: any*/),
              (v7/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bodyText",
                "storageKey": null
              },
              (v8/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": (v9/*: any*/),
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
                              (v10/*: any*/),
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v10/*: any*/),
                          (v11/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "onBehalfOf(first:10)"
              },
              (v12/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dismissedReviewState",
                "storageKey": null
              },
              (v13/*: any*/),
              (v11/*: any*/),
              (v14/*: any*/),
              (v15/*: any*/),
              (v16/*: any*/),
              (v17/*: any*/),
              (v18/*: any*/),
              (v19/*: any*/),
              {
                "alias": null,
                "args": (v20/*: any*/),
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
                          (v4/*: any*/),
                          {
                            "kind": "InlineFragment",
                            "selections": [
                              (v2/*: any*/),
                              (v21/*: any*/),
                              (v22/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "line",
                                "storageKey": null
                              },
                              (v23/*: any*/),
                              (v24/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": null,
                                "kind": "LinkedField",
                                "name": "subject",
                                "plural": false,
                                "selections": [
                                  (v4/*: any*/),
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
                                          (v25/*: any*/)
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
                              (v26/*: any*/),
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
                                          (v27/*: any*/),
                                          (v6/*: any*/),
                                          (v7/*: any*/),
                                          (v28/*: any*/),
                                          (v8/*: any*/),
                                          (v24/*: any*/),
                                          (v3/*: any*/),
                                          (v2/*: any*/),
                                          (v29/*: any*/),
                                          (v30/*: any*/),
                                          (v31/*: any*/),
                                          (v32/*: any*/),
                                          (v33/*: any*/),
                                          (v12/*: any*/),
                                          (v13/*: any*/),
                                          (v26/*: any*/),
                                          (v34/*: any*/),
                                          (v18/*: any*/),
                                          (v35/*: any*/),
                                          (v16/*: any*/),
                                          (v17/*: any*/),
                                          (v36/*: any*/),
                                          (v37/*: any*/),
                                          (v19/*: any*/),
                                          (v38/*: any*/),
                                          (v39/*: any*/),
                                          (v11/*: any*/),
                                          (v14/*: any*/),
                                          (v15/*: any*/),
                                          (v42/*: any*/),
                                          (v46/*: any*/)
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": null
                                  },
                                  (v45/*: any*/),
                                  (v25/*: any*/)
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
                              (v2/*: any*/),
                              (v24/*: any*/),
                              (v23/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "PullRequestThread",
                                "kind": "LinkedField",
                                "name": "pullRequestThread",
                                "plural": false,
                                "selections": [
                                  (v2/*: any*/),
                                  (v21/*: any*/),
                                  (v22/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v27/*: any*/),
                              (v6/*: any*/),
                              (v7/*: any*/),
                              (v28/*: any*/),
                              (v8/*: any*/),
                              (v3/*: any*/),
                              (v29/*: any*/),
                              (v30/*: any*/),
                              (v31/*: any*/),
                              (v32/*: any*/),
                              (v33/*: any*/),
                              (v12/*: any*/),
                              (v13/*: any*/),
                              (v26/*: any*/),
                              (v34/*: any*/),
                              (v18/*: any*/),
                              (v35/*: any*/),
                              (v16/*: any*/),
                              (v17/*: any*/),
                              (v36/*: any*/),
                              (v37/*: any*/),
                              (v19/*: any*/),
                              (v38/*: any*/),
                              (v39/*: any*/),
                              (v11/*: any*/),
                              (v14/*: any*/),
                              (v15/*: any*/),
                              (v46/*: any*/),
                              (v42/*: any*/)
                            ],
                            "type": "PullRequestReviewComment",
                            "abstractKey": null
                          },
                          (v44/*: any*/)
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
                "args": (v20/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "PullRequestReview_pullRequestThreadsAndReplies",
                "kind": "LinkedHandle",
                "name": "pullRequestThreadsAndReplies"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  (v40/*: any*/),
                  (v41/*: any*/),
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
                          (v4/*: any*/),
                          (v11/*: any*/),
                          (v5/*: any*/),
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Comment",
                "abstractKey": "__isComment"
              },
              (v46/*: any*/),
              (v25/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "381500769f5dd363cf0ad8313169a8b6",
    "metadata": {},
    "name": "updatePullRequestReviewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "f934676098f687f3f53bd7c582d02517";

export default node;

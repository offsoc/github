/**
 * @generated SignedSource<<2e93adeffa65407a9572c32763b5fa99>>
 * @relayHash 25ed5b6e019502d00939c72ceb1dfdd5
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 25ed5b6e019502d00939c72ceb1dfdd5

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommentAuthorAssociation = "COLLABORATOR" | "CONTRIBUTOR" | "FIRST_TIMER" | "FIRST_TIME_CONTRIBUTOR" | "MANNEQUIN" | "MEMBER" | "NONE" | "OWNER" | "%future added value";
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
export type AddCommentInput = {
  body: string;
  clientMutationId?: string | null | undefined;
  subjectId: string;
};
export type addCommentMutation$variables = {
  connections: ReadonlyArray<string>;
  input: AddCommentInput;
};
export type addCommentMutation$data = {
  readonly addComment: {
    readonly subject: {
      readonly id: string;
    } | null | undefined;
    readonly timelineEdge: {
      readonly node: {
        readonly " $fragmentSpreads": FragmentRefs<"IssueCommentViewerCommentRow" | "IssueComment_issueComment">;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type addCommentMutation$rawResponse = {
  readonly addComment: {
    readonly subject: {
      readonly __typename: string;
      readonly id: string;
    } | null | undefined;
    readonly timelineEdge: {
      readonly node: {
        readonly __typename: "IssueComment";
        readonly __isComment: "IssueComment";
        readonly __isNode: "IssueComment";
        readonly __isReactable: "IssueComment";
        readonly author: {
          readonly __typename: string;
          readonly avatarUrl: string;
          readonly id: string;
          readonly login: string;
        } | null | undefined;
        readonly authorAssociation: CommentAuthorAssociation;
        readonly authorToRepoOwnerSponsorship: {
          readonly createdAt: string;
          readonly id: string;
          readonly isActive: boolean;
        } | null | undefined;
        readonly body: string;
        readonly bodyHTML: string;
        readonly bodyVersion: string;
        readonly createdAt: string;
        readonly createdViaEmail: boolean;
        readonly databaseId: number | null | undefined;
        readonly id: string;
        readonly isHidden: boolean;
        readonly issue: {
          readonly author: {
            readonly __typename: string;
            readonly id: string;
            readonly login: string;
          } | null | undefined;
          readonly id: string;
          readonly locked: boolean;
          readonly number: number;
        };
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
        readonly pendingBlock?: boolean | null | undefined;
        readonly pendingMinimizeReason?: string | null | undefined;
        readonly pendingUnblock?: boolean | null | undefined;
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
          readonly databaseId: number | null | undefined;
          readonly id: string;
          readonly isPrivate: boolean;
          readonly name: string;
          readonly nameWithOwner: string;
          readonly owner: {
            readonly __typename: string;
            readonly id: string;
            readonly login: string;
            readonly url: string;
          };
          readonly slashCommandsEnabled: boolean;
        };
        readonly url: string;
        readonly viewerCanBlockFromOrg: boolean;
        readonly viewerCanDelete: boolean;
        readonly viewerCanMinimize: boolean;
        readonly viewerCanReadUserContentEdits: boolean;
        readonly viewerCanReport: boolean;
        readonly viewerCanReportToMaintainer: boolean;
        readonly viewerCanUnblockFromOrg: boolean;
        readonly viewerCanUpdate: boolean;
        readonly viewerDidAuthor: boolean;
      } | {
        readonly __typename: string;
        readonly __isNode: string;
        readonly id: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type addCommentMutation = {
  rawResponse: addCommentMutation$rawResponse;
  response: addCommentMutation$data;
  variables: addCommentMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
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
v3 = [
  (v2/*: any*/)
],
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
  "name": "databaseId",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v9 = [
  (v8/*: any*/)
],
v10 = {
  "kind": "InlineFragment",
  "selections": (v3/*: any*/),
  "type": "Node",
  "abstractKey": "__isNode"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "addCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddCommentPayload",
        "kind": "LinkedField",
        "name": "addComment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueTimelineItemEdge",
            "kind": "LinkedField",
            "name": "timelineEdge",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "IssueCommentViewerCommentRow"
                  },
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "IssueComment_issueComment"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "subject",
            "plural": false,
            "selections": (v3/*: any*/),
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
    "name": "addCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "AddCommentPayload",
        "kind": "LinkedField",
        "name": "addComment",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "IssueTimelineItemEdge",
            "kind": "LinkedField",
            "name": "timelineEdge",
            "plural": false,
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
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "body",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "unfurlReferences",
                            "value": true
                          }
                        ],
                        "kind": "ScalarField",
                        "name": "bodyHTML",
                        "storageKey": "bodyHTML(unfurlReferences:true)"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "bodyVersion",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanUpdate",
                        "storageKey": null
                      },
                      (v6/*: any*/),
                      (v7/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "authorAssociation",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanDelete",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanMinimize",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanReport",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanReportToMaintainer",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanBlockFromOrg",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerCanUnblockFromOrg",
                        "storageKey": null
                      },
                      {
                        "alias": "isHidden",
                        "args": null,
                        "kind": "ScalarField",
                        "name": "isMinimized",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "minimizedReason",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "createdViaEmail",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerDidAuthor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Sponsorship",
                        "kind": "LinkedField",
                        "name": "authorToRepoOwnerSponsorship",
                        "plural": false,
                        "selections": [
                          (v7/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isActive",
                            "storageKey": null
                          },
                          (v2/*: any*/)
                        ],
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
                          (v2/*: any*/),
                          (v8/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "avatarUrl",
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
                          (v2/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
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
                              (v8/*: any*/),
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isPrivate",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "slashCommandsEnabled",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "nameWithOwner",
                            "storageKey": null
                          },
                          (v5/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Issue",
                        "kind": "LinkedField",
                        "name": "issue",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "number",
                            "storageKey": null
                          },
                          (v2/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "locked",
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
                              (v8/*: any*/),
                              (v2/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "viewerCanReadUserContentEdits",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "lastEditedAt",
                            "storageKey": null
                          },
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
                                  (v6/*: any*/),
                                  (v8/*: any*/),
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
                      {
                        "kind": "ClientExtension",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "pendingMinimizeReason",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "pendingBlock",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "pendingUnblock",
                            "storageKey": null
                          }
                        ]
                      },
                      {
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
                                        "selections": (v9/*: any*/),
                                        "type": "User",
                                        "abstractKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": (v9/*: any*/),
                                        "type": "Bot",
                                        "abstractKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": (v9/*: any*/),
                                        "type": "Organization",
                                        "abstractKey": null
                                      },
                                      {
                                        "kind": "InlineFragment",
                                        "selections": (v9/*: any*/),
                                        "type": "Mannequin",
                                        "abstractKey": null
                                      },
                                      (v10/*: any*/)
                                    ],
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "totalCount",
                                    "storageKey": null
                                  }
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
                      }
                    ],
                    "type": "IssueComment",
                    "abstractKey": null
                  },
                  (v10/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "appendEdge",
            "key": "",
            "kind": "LinkedHandle",
            "name": "timelineEdge",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "subject",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "25ed5b6e019502d00939c72ceb1dfdd5",
    "metadata": {},
    "name": "addCommentMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "b5fc7d775d80535be8ba1d4a358732d7";

export default node;

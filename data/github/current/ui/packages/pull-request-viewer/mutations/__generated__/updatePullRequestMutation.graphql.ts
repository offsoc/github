/**
 * @generated SignedSource<<a69ede85ff22f0a642abf13a4b9d1a27>>
 * @relayHash b1fe9d0572d4f9142f3e0dbe540e3639
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID b1fe9d0572d4f9142f3e0dbe540e3639

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestUpdateState = "CLOSED" | "OPEN" | "%future added value";
export type ReactionContent = "CONFUSED" | "EYES" | "HEART" | "HOORAY" | "LAUGH" | "ROCKET" | "THUMBS_DOWN" | "THUMBS_UP" | "%future added value";
export type UpdatePullRequestInput = {
  assigneeIds?: ReadonlyArray<string> | null | undefined;
  baseRefName?: string | null | undefined;
  body?: string | null | undefined;
  clientMutationId?: string | null | undefined;
  labelIds?: ReadonlyArray<string> | null | undefined;
  maintainerCanModify?: boolean | null | undefined;
  milestoneId?: string | null | undefined;
  projectIds?: ReadonlyArray<string> | null | undefined;
  pullRequestId: string;
  state?: PullRequestUpdateState | null | undefined;
  title?: string | null | undefined;
};
export type updatePullRequestMutation$variables = {
  input: UpdatePullRequestInput;
};
export type updatePullRequestMutation$data = {
  readonly updatePullRequest: {
    readonly pullRequest: {
      readonly " $fragmentSpreads": FragmentRefs<"Description_pullRequest">;
    } | null | undefined;
  } | null | undefined;
};
export type updatePullRequestMutation$rawResponse = {
  readonly updatePullRequest: {
    readonly pullRequest: {
      readonly __isComment: "PullRequest";
      readonly __isReactable: "PullRequest";
      readonly author: {
        readonly __typename: string;
        readonly __isActor: string;
        readonly avatarUrl: string;
        readonly id: string;
        readonly login: string;
        readonly profileUrl: string | null | undefined;
      } | null | undefined;
      readonly body: string;
      readonly bodyHTML: string;
      readonly bodyVersion: string;
      readonly createdAt: string;
      readonly databaseId: number | null | undefined;
      readonly id: string;
      readonly locked: boolean;
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
        readonly nameWithOwner: string;
        readonly slashCommandsEnabled: boolean;
      };
      readonly viewerCanUpdate: boolean;
      readonly viewerDidAuthor: boolean;
    } | null | undefined;
  } | null | undefined;
};
export type updatePullRequestMutation = {
  rawResponse: updatePullRequestMutation$rawResponse;
  response: updatePullRequestMutation$data;
  variables: updatePullRequestMutation$variables;
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
v6 = [
  (v5/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updatePullRequestMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePullRequestPayload",
        "kind": "LinkedField",
        "name": "updatePullRequest",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "Description_pullRequest"
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
    "name": "updatePullRequestMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePullRequestPayload",
        "kind": "LinkedField",
        "name": "updatePullRequest",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              (v3/*: any*/),
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
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "nameWithOwner",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "slashCommandsEnabled",
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdate",
                "storageKey": null
              },
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
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "createdAt",
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
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "author",
                    "plural": false,
                    "selections": [
                      (v4/*: any*/),
                      {
                        "kind": "TypeDiscriminator",
                        "abstractKey": "__isActor"
                      },
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "avatarUrl",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "profileUrl",
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
                                "selections": (v6/*: any*/),
                                "type": "User",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v6/*: any*/),
                                "type": "Bot",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v6/*: any*/),
                                "type": "Organization",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v6/*: any*/),
                                "type": "Mannequin",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v2/*: any*/)
                                ],
                                "type": "Node",
                                "abstractKey": "__isNode"
                              }
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
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "b1fe9d0572d4f9142f3e0dbe540e3639",
    "metadata": {},
    "name": "updatePullRequestMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "564892e8e50b66de8a4fe6466762b2ed";

export default node;

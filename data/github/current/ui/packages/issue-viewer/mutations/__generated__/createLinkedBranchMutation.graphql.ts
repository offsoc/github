/**
 * @generated SignedSource<<ab5c01d9adfb3adcb5c8b05d6fcb0e4a>>
 * @relayHash 4b1dfbf2e29a53d7c30a82ce27502095
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4b1dfbf2e29a53d7c30a82ce27502095

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreateLinkedBranchInput = {
  clientMutationId?: string | null | undefined;
  issueId: string;
  name?: string | null | undefined;
  oid: any;
  repositoryId?: string | null | undefined;
};
export type createLinkedBranchMutation$variables = {
  input: CreateLinkedBranchInput;
};
export type createLinkedBranchMutation$data = {
  readonly createLinkedBranch: {
    readonly clientMutationId: string | null | undefined;
    readonly issue: {
      readonly linkedBranches: {
        readonly nodes: ReadonlyArray<{
          readonly id: string;
          readonly ref: {
            readonly " $fragmentSpreads": FragmentRefs<"BranchPickerRef">;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly repository: {
        readonly refs: {
          readonly nodes: ReadonlyArray<{
            readonly " $fragmentSpreads": FragmentRefs<"BranchPickerRef">;
          } | null | undefined> | null | undefined;
        } | null | undefined;
      };
    } | null | undefined;
    readonly linkedBranch: {
      readonly ref: {
        readonly id: string;
        readonly name: string;
        readonly prefix: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type createLinkedBranchMutation$rawResponse = {
  readonly createLinkedBranch: {
    readonly clientMutationId: string | null | undefined;
    readonly issue: {
      readonly id: string;
      readonly linkedBranches: {
        readonly nodes: ReadonlyArray<{
          readonly id: string;
          readonly ref: {
            readonly __typename: "Ref";
            readonly associatedPullRequests: {
              readonly totalCount: number;
            };
            readonly id: string;
            readonly name: string;
            readonly repository: {
              readonly defaultBranchRef: {
                readonly associatedPullRequests: {
                  readonly totalCount: number;
                };
                readonly id: string;
                readonly name: string;
                readonly repository: {
                  readonly id: string;
                };
                readonly target: {
                  readonly __typename: string;
                  readonly id: string;
                  readonly oid: any;
                } | null | undefined;
              } | null | undefined;
              readonly id: string;
              readonly nameWithOwner: string;
            };
            readonly target: {
              readonly __typename: string;
              readonly id: string;
              readonly oid: any;
            } | null | undefined;
          } | null | undefined;
        } | null | undefined> | null | undefined;
      };
      readonly repository: {
        readonly id: string;
        readonly refs: {
          readonly nodes: ReadonlyArray<{
            readonly __typename: "Ref";
            readonly associatedPullRequests: {
              readonly totalCount: number;
            };
            readonly id: string;
            readonly name: string;
            readonly repository: {
              readonly defaultBranchRef: {
                readonly associatedPullRequests: {
                  readonly totalCount: number;
                };
                readonly id: string;
                readonly name: string;
                readonly repository: {
                  readonly id: string;
                };
                readonly target: {
                  readonly __typename: string;
                  readonly id: string;
                  readonly oid: any;
                } | null | undefined;
              } | null | undefined;
              readonly id: string;
              readonly nameWithOwner: string;
            };
            readonly target: {
              readonly __typename: string;
              readonly id: string;
              readonly oid: any;
            } | null | undefined;
          } | null | undefined> | null | undefined;
        } | null | undefined;
      };
    } | null | undefined;
    readonly linkedBranch: {
      readonly id: string;
      readonly ref: {
        readonly id: string;
        readonly name: string;
        readonly prefix: string;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type createLinkedBranchMutation = {
  rawResponse: createLinkedBranchMutation$rawResponse;
  response: createLinkedBranchMutation$data;
  variables: createLinkedBranchMutation$variables;
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
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "Ref",
  "kind": "LinkedField",
  "name": "ref",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v3/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "prefix",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v5 = {
  "kind": "Literal",
  "name": "first",
  "value": 25
},
v6 = [
  (v5/*: any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "target",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "oid",
      "storageKey": null
    },
    (v2/*: any*/),
    (v7/*: any*/)
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequestConnection",
  "kind": "LinkedField",
  "name": "associatedPullRequests",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalCount",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v10 = [
  (v3/*: any*/),
  (v2/*: any*/),
  (v7/*: any*/),
  (v8/*: any*/),
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
        "name": "nameWithOwner",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Ref",
        "kind": "LinkedField",
        "name": "defaultBranchRef",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/),
          (v8/*: any*/),
          (v9/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Repository",
            "kind": "LinkedField",
            "name": "repository",
            "plural": false,
            "selections": [
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  (v9/*: any*/)
],
v11 = [
  {
    "kind": "InlineDataFragmentSpread",
    "name": "BranchPickerRef",
    "selections": (v10/*: any*/),
    "args": null,
    "argumentDefinitions": ([]/*: any*/)
  }
],
v12 = [
  (v5/*: any*/),
  {
    "kind": "Literal",
    "name": "refPrefix",
    "value": "refs/heads/"
  }
],
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "clientMutationId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "createLinkedBranchMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateLinkedBranchPayload",
        "kind": "LinkedField",
        "name": "createLinkedBranch",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "LinkedBranch",
            "kind": "LinkedField",
            "name": "linkedBranch",
            "plural": false,
            "selections": [
              (v4/*: any*/)
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
                "args": (v6/*: any*/),
                "concreteType": "LinkedBranchConnection",
                "kind": "LinkedField",
                "name": "linkedBranches",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "LinkedBranch",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Ref",
                        "kind": "LinkedField",
                        "name": "ref",
                        "plural": false,
                        "selections": (v11/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "linkedBranches(first:25)"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v12/*: any*/),
                    "concreteType": "RefConnection",
                    "kind": "LinkedField",
                    "name": "refs",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Ref",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": (v11/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": "refs(first:25,refPrefix:\"refs/heads/\")"
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          },
          (v13/*: any*/)
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
    "name": "createLinkedBranchMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateLinkedBranchPayload",
        "kind": "LinkedField",
        "name": "createLinkedBranch",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "LinkedBranch",
            "kind": "LinkedField",
            "name": "linkedBranch",
            "plural": false,
            "selections": [
              (v4/*: any*/),
              (v2/*: any*/)
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
                "args": (v6/*: any*/),
                "concreteType": "LinkedBranchConnection",
                "kind": "LinkedField",
                "name": "linkedBranches",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "LinkedBranch",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Ref",
                        "kind": "LinkedField",
                        "name": "ref",
                        "plural": false,
                        "selections": (v10/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "linkedBranches(first:25)"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v12/*: any*/),
                    "concreteType": "RefConnection",
                    "kind": "LinkedField",
                    "name": "refs",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Ref",
                        "kind": "LinkedField",
                        "name": "nodes",
                        "plural": true,
                        "selections": (v10/*: any*/),
                        "storageKey": null
                      }
                    ],
                    "storageKey": "refs(first:25,refPrefix:\"refs/heads/\")"
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              },
              (v2/*: any*/)
            ],
            "storageKey": null
          },
          (v13/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "4b1dfbf2e29a53d7c30a82ce27502095",
    "metadata": {},
    "name": "createLinkedBranchMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "87f922d60ef7426cb24482bc81549cde";

export default node;

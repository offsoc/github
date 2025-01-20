/**
 * @generated SignedSource<<956779f0538e10d89ae26b660d87983b>>
 * @relayHash 25e2e16efc92a0f22e68aa3e80cd0ae4
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 25e2e16efc92a0f22e68aa3e80cd0ae4

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueState = "CLOSED" | "OPEN" | "%future added value";
export type IssueStateReason = "COMPLETED" | "NOT_PLANNED" | "REOPENED" | "%future added value";
export type PrioritizePinnedIssuesInput = {
  clientMutationId?: string | null | undefined;
  issueIds: ReadonlyArray<string>;
  repositoryId: string;
};
export type prioritizePinnedIssuesMutation$variables = {
  input: PrioritizePinnedIssuesInput;
};
export type prioritizePinnedIssuesMutation$data = {
  readonly prioritizePinnedIssues: {
    readonly repository: {
      readonly pinnedIssues: {
        readonly nodes: ReadonlyArray<{
          readonly issue: {
            readonly id: string;
            readonly title: string;
            readonly " $fragmentSpreads": FragmentRefs<"PinnedIssueIssue">;
          };
        } | null | undefined> | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type prioritizePinnedIssuesMutation$rawResponse = {
  readonly prioritizePinnedIssues: {
    readonly repository: {
      readonly id: string;
      readonly pinnedIssues: {
        readonly nodes: ReadonlyArray<{
          readonly id: string;
          readonly issue: {
            readonly author: {
              readonly __typename: string;
              readonly id: string;
              readonly login: string;
              readonly url: string;
            } | null | undefined;
            readonly createdAt: string;
            readonly id: string;
            readonly number: number;
            readonly repository: {
              readonly id: string;
              readonly viewerCanPinIssues: boolean;
            };
            readonly state: IssueState;
            readonly stateReason: IssueStateReason | null | undefined;
            readonly title: string;
            readonly titleHTML: string;
            readonly totalCommentsCount: number | null | undefined;
            readonly url: string;
          };
        } | null | undefined> | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type prioritizePinnedIssuesMutation = {
  rawResponse: prioritizePinnedIssuesMutation$rawResponse;
  response: prioritizePinnedIssuesMutation$data;
  variables: prioritizePinnedIssuesMutation$variables;
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
v2 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 3
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "prioritizePinnedIssuesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "PrioritizePinnedIssuesPayload",
        "kind": "LinkedField",
        "name": "prioritizePinnedIssues",
        "plural": false,
        "selections": [
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
                "args": (v2/*: any*/),
                "concreteType": "PinnedIssueConnection",
                "kind": "LinkedField",
                "name": "pinnedIssues",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PinnedIssue",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Issue",
                        "kind": "LinkedField",
                        "name": "issue",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v4/*: any*/),
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "PinnedIssueIssue"
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "pinnedIssues(first:3)"
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
    "name": "prioritizePinnedIssuesMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "PrioritizePinnedIssuesPayload",
        "kind": "LinkedField",
        "name": "prioritizePinnedIssues",
        "plural": false,
        "selections": [
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
                "args": (v2/*: any*/),
                "concreteType": "PinnedIssueConnection",
                "kind": "LinkedField",
                "name": "pinnedIssues",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PinnedIssue",
                    "kind": "LinkedField",
                    "name": "nodes",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Issue",
                        "kind": "LinkedField",
                        "name": "issue",
                        "plural": false,
                        "selections": [
                          (v3/*: any*/),
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "titleHTML",
                            "storageKey": null
                          },
                          (v5/*: any*/),
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
                            "name": "state",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "stateReason",
                            "storageKey": null
                          },
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
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "__typename",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "login",
                                "storageKey": null
                              },
                              (v5/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "totalCommentsCount",
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
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "viewerCanPinIssues",
                                "storageKey": null
                              },
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "pinnedIssues(first:3)"
              },
              (v3/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "25e2e16efc92a0f22e68aa3e80cd0ae4",
    "metadata": {},
    "name": "prioritizePinnedIssuesMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "8d81d4322538bb0f6ee082e437422283";

export default node;

/**
 * @generated SignedSource<<c46dd248d37b9243c898c3f4f55d9e1c>>
 * @relayHash 35fce8e8809c5d2e1f89aa0abfc914ca
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 35fce8e8809c5d2e1f89aa0abfc914ca

import { ConcreteRequest, Query } from 'relay-runtime';
export type useFetchAnchoredAnnotationData_AnchoredAnnotationQuery$variables = {
  number: number;
  owner: string;
  repo: string;
};
export type useFetchAnchoredAnnotationData_AnchoredAnnotationQuery$data = {
  readonly repository: {
    readonly pullRequest: {
      readonly headCommit: {
        readonly commit: {
          readonly checkSuites: {
            readonly edges: ReadonlyArray<{
              readonly node: {
                readonly checkRuns: {
                  readonly edges: ReadonlyArray<{
                    readonly node: {
                      readonly annotations: {
                        readonly edges: ReadonlyArray<{
                          readonly node: {
                            readonly __id: string;
                            readonly databaseId: number | null | undefined;
                            readonly pathDigest: string;
                          } | null | undefined;
                        } | null | undefined> | null | undefined;
                      } | null | undefined;
                    } | null | undefined;
                  } | null | undefined> | null | undefined;
                } | null | undefined;
              } | null | undefined;
            } | null | undefined> | null | undefined;
          } | null | undefined;
        };
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type useFetchAnchoredAnnotationData_AnchoredAnnotationQuery = {
  response: useFetchAnchoredAnnotationData_AnchoredAnnotationQuery$data;
  variables: useFetchAnchoredAnnotationData_AnchoredAnnotationQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v3 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v4 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v5 = {
  "kind": "Literal",
  "name": "last",
  "value": 100
},
v6 = [
  (v5/*: any*/)
],
v7 = [
  {
    "kind": "Literal",
    "name": "filterBy",
    "value": {
      "checkType": "LATEST"
    }
  },
  (v5/*: any*/)
],
v8 = {
  "alias": null,
  "args": (v6/*: any*/),
  "concreteType": "CheckAnnotationConnection",
  "kind": "LinkedField",
  "name": "annotations",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "CheckAnnotationEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "CheckAnnotation",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "databaseId",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "pathDigest",
              "storageKey": null
            },
            {
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
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": "annotations(last:100)"
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useFetchAnchoredAnnotationData_AnchoredAnnotationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestCommit",
                "kind": "LinkedField",
                "name": "headCommit",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Commit",
                    "kind": "LinkedField",
                    "name": "commit",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": (v6/*: any*/),
                        "concreteType": "CheckSuiteConnection",
                        "kind": "LinkedField",
                        "name": "checkSuites",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "CheckSuiteEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "CheckSuite",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": (v7/*: any*/),
                                    "concreteType": "CheckRunConnection",
                                    "kind": "LinkedField",
                                    "name": "checkRuns",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "CheckRunEdge",
                                        "kind": "LinkedField",
                                        "name": "edges",
                                        "plural": true,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "CheckRun",
                                            "kind": "LinkedField",
                                            "name": "node",
                                            "plural": false,
                                            "selections": [
                                              (v8/*: any*/)
                                            ],
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": "checkRuns(filterBy:{\"checkType\":\"LATEST\"},last:100)"
                                  }
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "checkSuites(last:100)"
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
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "useFetchAnchoredAnnotationData_AnchoredAnnotationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestCommit",
                "kind": "LinkedField",
                "name": "headCommit",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Commit",
                    "kind": "LinkedField",
                    "name": "commit",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": (v6/*: any*/),
                        "concreteType": "CheckSuiteConnection",
                        "kind": "LinkedField",
                        "name": "checkSuites",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "CheckSuiteEdge",
                            "kind": "LinkedField",
                            "name": "edges",
                            "plural": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "CheckSuite",
                                "kind": "LinkedField",
                                "name": "node",
                                "plural": false,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": (v7/*: any*/),
                                    "concreteType": "CheckRunConnection",
                                    "kind": "LinkedField",
                                    "name": "checkRuns",
                                    "plural": false,
                                    "selections": [
                                      {
                                        "alias": null,
                                        "args": null,
                                        "concreteType": "CheckRunEdge",
                                        "kind": "LinkedField",
                                        "name": "edges",
                                        "plural": true,
                                        "selections": [
                                          {
                                            "alias": null,
                                            "args": null,
                                            "concreteType": "CheckRun",
                                            "kind": "LinkedField",
                                            "name": "node",
                                            "plural": false,
                                            "selections": [
                                              (v8/*: any*/),
                                              (v9/*: any*/)
                                            ],
                                            "storageKey": null
                                          }
                                        ],
                                        "storageKey": null
                                      }
                                    ],
                                    "storageKey": "checkRuns(filterBy:{\"checkType\":\"LATEST\"},last:100)"
                                  },
                                  (v9/*: any*/)
                                ],
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": "checkSuites(last:100)"
                      },
                      (v9/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v9/*: any*/)
                ],
                "storageKey": null
              },
              (v9/*: any*/)
            ],
            "storageKey": null
          },
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "35fce8e8809c5d2e1f89aa0abfc914ca",
    "metadata": {},
    "name": "useFetchAnchoredAnnotationData_AnchoredAnnotationQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "83659150eaece8168cb604c386795bc0";

export default node;

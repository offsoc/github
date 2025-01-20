/**
 * @generated SignedSource<<f77e0c530e43ad42f64068e6afe7929c>>
 * @relayHash 8a1d9e791a2c48ab94c980238b0a2856
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 8a1d9e791a2c48ab94c980238b0a2856

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ClosedByPullRequestsReferencesStoryQuery$variables = {
  id: string;
};
export type ClosedByPullRequestsReferencesStoryQuery$data = {
  readonly node: {
    readonly " $fragmentSpreads": FragmentRefs<"ClosedByPullRequestsReferences" | "ClosedByPullRequestsReferencesList">;
  } | null | undefined;
};
export type ClosedByPullRequestsReferencesStoryQuery = {
  response: ClosedByPullRequestsReferencesStoryQuery$data;
  variables: ClosedByPullRequestsReferencesStoryQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "kind": "Literal",
  "name": "first",
  "value": 10
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
v5 = [
  (v2/*: any*/),
  {
    "kind": "Literal",
    "name": "includeClosedPrs",
    "value": true
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClosedByPullRequestsReferencesStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "args": (v3/*: any*/),
                "kind": "FragmentSpread",
                "name": "ClosedByPullRequestsReferences"
              },
              {
                "args": (v3/*: any*/),
                "kind": "FragmentSpread",
                "name": "ClosedByPullRequestsReferencesList"
              }
            ],
            "type": "Issue",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ClosedByPullRequestsReferencesStoryQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "PullRequestConnection",
                "kind": "LinkedField",
                "name": "closedByPullRequestsReferences",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "totalCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequest",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          (v6/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "title",
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
                            "kind": "ScalarField",
                            "name": "merged",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "closed",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isDraft",
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
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "login",
                                    "storageKey": null
                                  },
                                  (v6/*: any*/)
                                ],
                                "storageKey": null
                              },
                              (v6/*: any*/)
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "url",
                            "storageKey": null
                          },
                          (v4/*: any*/)
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
                "storageKey": "closedByPullRequestsReferences(first:10,includeClosedPrs:true)"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "filters": [
                  "includeClosedPrs"
                ],
                "handle": "connection",
                "key": "ClosedByPullRequestsReferences__closedByPullRequestsReferences",
                "kind": "LinkedHandle",
                "name": "closedByPullRequestsReferences"
              }
            ],
            "type": "Issue",
            "abstractKey": null
          },
          (v6/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "8a1d9e791a2c48ab94c980238b0a2856",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": (v7/*: any*/),
        "node.closedByPullRequestsReferences": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestConnection"
        },
        "node.closedByPullRequestsReferences.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestEdge"
        },
        "node.closedByPullRequestsReferences.edges.cursor": (v7/*: any*/),
        "node.closedByPullRequestsReferences.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequest"
        },
        "node.closedByPullRequestsReferences.edges.node.__typename": (v7/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.closed": (v8/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.id": (v9/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.isDraft": (v8/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.merged": (v8/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.number": (v10/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "node.closedByPullRequestsReferences.edges.node.repository.id": (v9/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.repository.name": (v7/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "node.closedByPullRequestsReferences.edges.node.repository.owner.__typename": (v7/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.repository.owner.id": (v9/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.repository.owner.login": (v7/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.title": (v7/*: any*/),
        "node.closedByPullRequestsReferences.edges.node.url": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "node.closedByPullRequestsReferences.pageInfo": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PageInfo"
        },
        "node.closedByPullRequestsReferences.pageInfo.endCursor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "node.closedByPullRequestsReferences.pageInfo.hasNextPage": (v8/*: any*/),
        "node.closedByPullRequestsReferences.totalCount": (v10/*: any*/),
        "node.id": (v9/*: any*/)
      }
    },
    "name": "ClosedByPullRequestsReferencesStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "52388398d5ff24097a07db5adcb44714";

export default node;

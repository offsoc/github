/**
 * @generated SignedSource<<55c0d01748173b8ecdfdbfbc955ea46b>>
 * @relayHash d99cd5cd67ee9032de1d77906324bdc4
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d99cd5cd67ee9032de1d77906324bdc4

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeadRefForcePushedEventStoryQuery$variables = {
  id: string;
};
export type HeadRefForcePushedEventStoryQuery$data = {
  readonly headRefForcePushedEvent: {
    readonly " $fragmentSpreads": FragmentRefs<"HeadRefForcePushedEvent_headRefForcePushedEvent">;
  } | null | undefined;
};
export type HeadRefForcePushedEventStoryQuery = {
  response: HeadRefForcePushedEventStoryQuery$data;
  variables: HeadRefForcePushedEventStoryQuery$variables;
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "abbreviatedOid",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "oid",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Commit"
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "GitObjectID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "HeadRefForcePushedEventStoryQuery",
    "selections": [
      {
        "alias": "headRefForcePushedEvent",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "HeadRefForcePushedEvent_headRefForcePushedEvent"
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
    "name": "HeadRefForcePushedEventStoryQuery",
    "selections": [
      {
        "alias": "headRefForcePushedEvent",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
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
                "name": "refName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Commit",
                "kind": "LinkedField",
                "name": "beforeCommit",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Commit",
                "kind": "LinkedField",
                "name": "afterCommit",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v4/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "authoredDate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "first",
                        "value": 1
                      }
                    ],
                    "concreteType": "GitActorConnection",
                    "kind": "LinkedField",
                    "name": "authors",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "GitActorEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "GitActor",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "User",
                                "kind": "LinkedField",
                                "name": "user",
                                "plural": false,
                                "selections": [
                                  {
                                    "kind": "InlineFragment",
                                    "selections": [
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
                                      {
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "login",
                                        "storageKey": null
                                      },
                                      (v2/*: any*/)
                                    ],
                                    "type": "Actor",
                                    "abstractKey": "__isActor"
                                  },
                                  (v5/*: any*/)
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
                    "storageKey": "authors(first:1)"
                  },
                  (v5/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "HeadRefForcePushedEvent",
            "abstractKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "d99cd5cd67ee9032de1d77906324bdc4",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "headRefForcePushedEvent": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "headRefForcePushedEvent.__typename": (v6/*: any*/),
        "headRefForcePushedEvent.afterCommit": (v7/*: any*/),
        "headRefForcePushedEvent.afterCommit.abbreviatedOid": (v6/*: any*/),
        "headRefForcePushedEvent.afterCommit.authoredDate": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "headRefForcePushedEvent.afterCommit.authors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitActorConnection"
        },
        "headRefForcePushedEvent.afterCommit.authors.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "GitActorEdge"
        },
        "headRefForcePushedEvent.afterCommit.authors.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitActor"
        },
        "headRefForcePushedEvent.afterCommit.authors.edges.node.user": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "headRefForcePushedEvent.afterCommit.authors.edges.node.user.__isActor": (v6/*: any*/),
        "headRefForcePushedEvent.afterCommit.authors.edges.node.user.__typename": (v6/*: any*/),
        "headRefForcePushedEvent.afterCommit.authors.edges.node.user.avatarUrl": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "headRefForcePushedEvent.afterCommit.authors.edges.node.user.id": (v8/*: any*/),
        "headRefForcePushedEvent.afterCommit.authors.edges.node.user.login": (v6/*: any*/),
        "headRefForcePushedEvent.afterCommit.id": (v8/*: any*/),
        "headRefForcePushedEvent.afterCommit.oid": (v9/*: any*/),
        "headRefForcePushedEvent.beforeCommit": (v7/*: any*/),
        "headRefForcePushedEvent.beforeCommit.abbreviatedOid": (v6/*: any*/),
        "headRefForcePushedEvent.beforeCommit.id": (v8/*: any*/),
        "headRefForcePushedEvent.beforeCommit.oid": (v9/*: any*/),
        "headRefForcePushedEvent.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "headRefForcePushedEvent.id": (v8/*: any*/),
        "headRefForcePushedEvent.refName": (v6/*: any*/)
      }
    },
    "name": "HeadRefForcePushedEventStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "075b07cf436676a505f1521087018f2e";

export default node;

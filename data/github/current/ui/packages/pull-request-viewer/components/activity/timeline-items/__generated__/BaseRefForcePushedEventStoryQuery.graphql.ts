/**
 * @generated SignedSource<<60a863c50f51364e51ddf8747e7b8fad>>
 * @relayHash 4702027fba719cc34ec83a0c90d83ecb
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 4702027fba719cc34ec83a0c90d83ecb

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BaseRefForcePushedEventStoryQuery$variables = {
  id: string;
};
export type BaseRefForcePushedEventStoryQuery$data = {
  readonly baseRefForcePushedEvent: {
    readonly " $fragmentSpreads": FragmentRefs<"BaseRefForcePushedEvent_baseRefForcePushedEvent">;
  } | null | undefined;
};
export type BaseRefForcePushedEventStoryQuery = {
  response: BaseRefForcePushedEventStoryQuery$data;
  variables: BaseRefForcePushedEventStoryQuery$variables;
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
    "name": "BaseRefForcePushedEventStoryQuery",
    "selections": [
      {
        "alias": "baseRefForcePushedEvent",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "BaseRefForcePushedEvent_baseRefForcePushedEvent"
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
    "name": "BaseRefForcePushedEventStoryQuery",
    "selections": [
      {
        "alias": "baseRefForcePushedEvent",
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
            "type": "BaseRefForcePushedEvent",
            "abstractKey": null
          },
          (v5/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "4702027fba719cc34ec83a0c90d83ecb",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "baseRefForcePushedEvent": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "baseRefForcePushedEvent.__typename": (v6/*: any*/),
        "baseRefForcePushedEvent.afterCommit": (v7/*: any*/),
        "baseRefForcePushedEvent.afterCommit.abbreviatedOid": (v6/*: any*/),
        "baseRefForcePushedEvent.afterCommit.authoredDate": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "baseRefForcePushedEvent.afterCommit.authors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitActorConnection"
        },
        "baseRefForcePushedEvent.afterCommit.authors.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "GitActorEdge"
        },
        "baseRefForcePushedEvent.afterCommit.authors.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitActor"
        },
        "baseRefForcePushedEvent.afterCommit.authors.edges.node.user": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "baseRefForcePushedEvent.afterCommit.authors.edges.node.user.__isActor": (v6/*: any*/),
        "baseRefForcePushedEvent.afterCommit.authors.edges.node.user.__typename": (v6/*: any*/),
        "baseRefForcePushedEvent.afterCommit.authors.edges.node.user.avatarUrl": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "baseRefForcePushedEvent.afterCommit.authors.edges.node.user.id": (v8/*: any*/),
        "baseRefForcePushedEvent.afterCommit.authors.edges.node.user.login": (v6/*: any*/),
        "baseRefForcePushedEvent.afterCommit.id": (v8/*: any*/),
        "baseRefForcePushedEvent.afterCommit.oid": (v9/*: any*/),
        "baseRefForcePushedEvent.beforeCommit": (v7/*: any*/),
        "baseRefForcePushedEvent.beforeCommit.abbreviatedOid": (v6/*: any*/),
        "baseRefForcePushedEvent.beforeCommit.id": (v8/*: any*/),
        "baseRefForcePushedEvent.beforeCommit.oid": (v9/*: any*/),
        "baseRefForcePushedEvent.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "baseRefForcePushedEvent.id": (v8/*: any*/),
        "baseRefForcePushedEvent.refName": (v6/*: any*/)
      }
    },
    "name": "BaseRefForcePushedEventStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "33ac29b7a52c337a6a92910ae01171aa";

export default node;

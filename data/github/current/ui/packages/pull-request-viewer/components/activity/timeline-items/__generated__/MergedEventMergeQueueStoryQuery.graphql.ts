/**
 * @generated SignedSource<<eecb128b465d473c266bb675a843496c>>
 * @relayHash 41a0279cd74ab3c591b392b34318fd1c
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 41a0279cd74ab3c591b392b34318fd1c

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MergedEventMergeQueueStoryQuery$variables = {
  id: string;
};
export type MergedEventMergeQueueStoryQuery$data = {
  readonly mergedEvent: {
    readonly " $fragmentSpreads": FragmentRefs<"MergedEvent_mergedEvent">;
  } | null | undefined;
};
export type MergedEventMergeQueueStoryQuery = {
  response: MergedEventMergeQueueStoryQuery$data;
  variables: MergedEventMergeQueueStoryQuery$variables;
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
  "name": "id",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v6 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "MergedEventMergeQueueStoryQuery",
    "selections": [
      {
        "alias": "mergedEvent",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "MergedEvent_mergedEvent"
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
    "name": "MergedEventMergeQueueStoryQuery",
    "selections": [
      {
        "alias": "mergedEvent",
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
                "concreteType": null,
                "kind": "LinkedField",
                "name": "actor",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isActor"
                  },
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
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": "mergeCommit",
                "args": null,
                "concreteType": "Commit",
                "kind": "LinkedField",
                "name": "commit",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "abbreviatedOid",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "oid",
                    "storageKey": null
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "mergeRefName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viaMergeQueue",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viaMergeQueueAPI",
                "storageKey": null
              },
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
                "name": "databaseId",
                "storageKey": null
              }
            ],
            "type": "MergedEvent",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "41a0279cd74ab3c591b392b34318fd1c",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "mergedEvent": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "mergedEvent.__typename": (v4/*: any*/),
        "mergedEvent.actor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "mergedEvent.actor.__isActor": (v4/*: any*/),
        "mergedEvent.actor.__typename": (v4/*: any*/),
        "mergedEvent.actor.avatarUrl": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "mergedEvent.actor.id": (v5/*: any*/),
        "mergedEvent.actor.login": (v4/*: any*/),
        "mergedEvent.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "mergedEvent.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "mergedEvent.id": (v5/*: any*/),
        "mergedEvent.mergeCommit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Commit"
        },
        "mergedEvent.mergeCommit.abbreviatedOid": (v4/*: any*/),
        "mergedEvent.mergeCommit.id": (v5/*: any*/),
        "mergedEvent.mergeCommit.oid": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitObjectID"
        },
        "mergedEvent.mergeRefName": (v4/*: any*/),
        "mergedEvent.viaMergeQueue": (v6/*: any*/),
        "mergedEvent.viaMergeQueueAPI": (v6/*: any*/)
      }
    },
    "name": "MergedEventMergeQueueStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "fd6330910ca2a55a0c76e1b7ef9f960d";

export default node;

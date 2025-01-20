/**
 * @generated SignedSource<<587550329786a4bd2e9a19cb016c0f3f>>
 * @relayHash 114154284b8db8900e060a458641a1a0
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 114154284b8db8900e060a458641a1a0

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewRequestedEventSimpleStoryQuery$variables = {
  id: string;
};
export type ReviewRequestedEventSimpleStoryQuery$data = {
  readonly reviewRequestedEvent: {
    readonly " $fragmentSpreads": FragmentRefs<"ReviewRequestedEvent_reviewRequestedEvent">;
  } | null | undefined;
};
export type ReviewRequestedEventSimpleStoryQuery = {
  response: ReviewRequestedEventSimpleStoryQuery$data;
  variables: ReviewRequestedEventSimpleStoryQuery$variables;
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
  "name": "login",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "resourcePath",
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
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ReviewRequestedEventSimpleStoryQuery",
    "selections": [
      {
        "alias": "reviewRequestedEvent",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReviewRequestedEvent_reviewRequestedEvent"
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
    "name": "ReviewRequestedEventSimpleStoryQuery",
    "selections": [
      {
        "alias": "reviewRequestedEvent",
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
                  (v3/*: any*/),
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "requestedReviewAssignedFromTeamName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "ReviewRequest",
                "kind": "LinkedField",
                "name": "reviewRequest",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "codeOwnersResourcePath",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "requestedReviewer",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v3/*: any*/),
                          (v5/*: any*/)
                        ],
                        "type": "User",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "combinedSlug",
                            "storageKey": null
                          },
                          (v5/*: any*/)
                        ],
                        "type": "Team",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          (v4/*: any*/)
                        ],
                        "type": "Node",
                        "abstractKey": "__isNode"
                      }
                    ],
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
            "type": "ReviewRequestedEvent",
            "abstractKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "114154284b8db8900e060a458641a1a0",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "reviewRequestedEvent": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "reviewRequestedEvent.__typename": (v6/*: any*/),
        "reviewRequestedEvent.actor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "reviewRequestedEvent.actor.__isActor": (v6/*: any*/),
        "reviewRequestedEvent.actor.__typename": (v6/*: any*/),
        "reviewRequestedEvent.actor.avatarUrl": (v7/*: any*/),
        "reviewRequestedEvent.actor.id": (v8/*: any*/),
        "reviewRequestedEvent.actor.login": (v6/*: any*/),
        "reviewRequestedEvent.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "reviewRequestedEvent.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "reviewRequestedEvent.id": (v8/*: any*/),
        "reviewRequestedEvent.requestedReviewAssignedFromTeamName": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "reviewRequestedEvent.reviewRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "ReviewRequest"
        },
        "reviewRequestedEvent.reviewRequest.codeOwnersResourcePath": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "URI"
        },
        "reviewRequestedEvent.reviewRequest.id": (v8/*: any*/),
        "reviewRequestedEvent.reviewRequest.requestedReviewer": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "RequestedReviewer"
        },
        "reviewRequestedEvent.reviewRequest.requestedReviewer.__isNode": (v6/*: any*/),
        "reviewRequestedEvent.reviewRequest.requestedReviewer.__typename": (v6/*: any*/),
        "reviewRequestedEvent.reviewRequest.requestedReviewer.combinedSlug": (v6/*: any*/),
        "reviewRequestedEvent.reviewRequest.requestedReviewer.id": (v8/*: any*/),
        "reviewRequestedEvent.reviewRequest.requestedReviewer.login": (v6/*: any*/),
        "reviewRequestedEvent.reviewRequest.requestedReviewer.resourcePath": (v7/*: any*/)
      }
    },
    "name": "ReviewRequestedEventSimpleStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "0e4d017ae63cfba51b35897b12670ba2";

export default node;

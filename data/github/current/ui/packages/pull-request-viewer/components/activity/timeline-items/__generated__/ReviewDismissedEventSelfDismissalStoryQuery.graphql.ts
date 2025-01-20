/**
 * @generated SignedSource<<d8b2da5ac493923b5637f9dc5afcf9f3>>
 * @relayHash 9b5561f2a9678569d7cc5b8b9161d2fc
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 9b5561f2a9678569d7cc5b8b9161d2fc

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewDismissedEventSelfDismissalStoryQuery$variables = {
  id: string;
};
export type ReviewDismissedEventSelfDismissalStoryQuery$data = {
  readonly reviewDismissedEvent: {
    readonly " $fragmentSpreads": FragmentRefs<"ReviewDismissedEvent_reviewDismissedEvent">;
  } | null | undefined;
};
export type ReviewDismissedEventSelfDismissalStoryQuery = {
  response: ReviewDismissedEventSelfDismissalStoryQuery$data;
  variables: ReviewDismissedEventSelfDismissalStoryQuery$variables;
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
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
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
    "name": "ReviewDismissedEventSelfDismissalStoryQuery",
    "selections": [
      {
        "alias": "reviewDismissedEvent",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReviewDismissedEvent_reviewDismissedEvent"
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
    "name": "ReviewDismissedEventSelfDismissalStoryQuery",
    "selections": [
      {
        "alias": "reviewDismissedEvent",
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
                  (v3/*: any*/),
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
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestCommit",
                "kind": "LinkedField",
                "name": "pullRequestCommit",
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
                        "args": null,
                        "kind": "ScalarField",
                        "name": "abbreviatedOid",
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
                    "name": "resourcePath",
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestReview",
                "kind": "LinkedField",
                "name": "review",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "fullDatabaseId",
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
                      (v2/*: any*/),
                      (v3/*: any*/),
                      (v4/*: any*/)
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
                "name": "dismissalMessageHTML",
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
            "type": "ReviewDismissedEvent",
            "abstractKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "9b5561f2a9678569d7cc5b8b9161d2fc",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "reviewDismissedEvent": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "reviewDismissedEvent.__typename": (v5/*: any*/),
        "reviewDismissedEvent.actor": (v6/*: any*/),
        "reviewDismissedEvent.actor.__isActor": (v5/*: any*/),
        "reviewDismissedEvent.actor.__typename": (v5/*: any*/),
        "reviewDismissedEvent.actor.avatarUrl": (v7/*: any*/),
        "reviewDismissedEvent.actor.id": (v8/*: any*/),
        "reviewDismissedEvent.actor.login": (v5/*: any*/),
        "reviewDismissedEvent.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "reviewDismissedEvent.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "reviewDismissedEvent.dismissalMessageHTML": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "reviewDismissedEvent.id": (v8/*: any*/),
        "reviewDismissedEvent.pullRequestCommit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestCommit"
        },
        "reviewDismissedEvent.pullRequestCommit.commit": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Commit"
        },
        "reviewDismissedEvent.pullRequestCommit.commit.abbreviatedOid": (v5/*: any*/),
        "reviewDismissedEvent.pullRequestCommit.commit.id": (v8/*: any*/),
        "reviewDismissedEvent.pullRequestCommit.id": (v8/*: any*/),
        "reviewDismissedEvent.pullRequestCommit.resourcePath": (v7/*: any*/),
        "reviewDismissedEvent.review": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestReview"
        },
        "reviewDismissedEvent.review.author": (v6/*: any*/),
        "reviewDismissedEvent.review.author.__typename": (v5/*: any*/),
        "reviewDismissedEvent.review.author.id": (v8/*: any*/),
        "reviewDismissedEvent.review.author.login": (v5/*: any*/),
        "reviewDismissedEvent.review.fullDatabaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "BigInt"
        },
        "reviewDismissedEvent.review.id": (v8/*: any*/)
      }
    },
    "name": "ReviewDismissedEventSelfDismissalStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "7043b23a452c0e2ef9d78186854a5240";

export default node;

/**
 * @generated SignedSource<<d6134ffe1a0118b28867031ea23e4ec5>>
 * @relayHash 1883f77eefb3565ad849e3d61113356a
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 1883f77eefb3565ad849e3d61113356a

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestCommitWithVerificationStoryQuery$variables = {
  id: string;
};
export type PullRequestCommitWithVerificationStoryQuery$data = {
  readonly pullRequestCommit: {
    readonly " $fragmentSpreads": FragmentRefs<"PullRequestCommit_pullRequestCommit">;
  } | null | undefined;
};
export type PullRequestCommitWithVerificationStoryQuery = {
  response: PullRequestCommitWithVerificationStoryQuery$data;
  variables: PullRequestCommitWithVerificationStoryQuery$variables;
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PullRequestCommitWithVerificationStoryQuery",
    "selections": [
      {
        "alias": "pullRequestCommit",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "PullRequestCommit_pullRequestCommit"
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
    "name": "PullRequestCommitWithVerificationStoryQuery",
    "selections": [
      {
        "alias": "pullRequestCommit",
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "message",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "authoredDate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "verificationStatus",
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
                                  (v3/*: any*/)
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
                  (v3/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "type": "PullRequestCommit",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "1883f77eefb3565ad849e3d61113356a",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequestCommit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequestCommit.__typename": (v4/*: any*/),
        "pullRequestCommit.commit": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Commit"
        },
        "pullRequestCommit.commit.abbreviatedOid": (v4/*: any*/),
        "pullRequestCommit.commit.authoredDate": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequestCommit.commit.authors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitActorConnection"
        },
        "pullRequestCommit.commit.authors.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "GitActorEdge"
        },
        "pullRequestCommit.commit.authors.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitActor"
        },
        "pullRequestCommit.commit.authors.edges.node.user": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "pullRequestCommit.commit.authors.edges.node.user.__isActor": (v4/*: any*/),
        "pullRequestCommit.commit.authors.edges.node.user.__typename": (v4/*: any*/),
        "pullRequestCommit.commit.authors.edges.node.user.avatarUrl": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "URI"
        },
        "pullRequestCommit.commit.authors.edges.node.user.id": (v5/*: any*/),
        "pullRequestCommit.commit.authors.edges.node.user.login": (v4/*: any*/),
        "pullRequestCommit.commit.id": (v5/*: any*/),
        "pullRequestCommit.commit.message": (v4/*: any*/),
        "pullRequestCommit.commit.oid": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "GitObjectID"
        },
        "pullRequestCommit.commit.verificationStatus": {
          "enumValues": [
            "PARTIALLY_VERIFIED",
            "UNSIGNED",
            "UNVERIFIED",
            "VERIFIED"
          ],
          "nullable": true,
          "plural": false,
          "type": "CommitVerificationStatus"
        },
        "pullRequestCommit.id": (v5/*: any*/)
      }
    },
    "name": "PullRequestCommitWithVerificationStoryQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "1a24a0b6d9f5cbeaa6f1aa9ea85b26f9";

export default node;

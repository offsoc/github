/**
 * @generated SignedSource<<b05a6d4e6c872658f993fc5b5787f38f>>
 * @relayHash 069aa6a233deb3ed97d10831800ce315
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 069aa6a233deb3ed97d10831800ce315

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CommitsSelectorTestQuery$variables = {
  pullRequestId: string;
};
export type CommitsSelectorTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"CommitsSelector_pullRequest">;
  } | null | undefined;
};
export type CommitsSelectorTestQuery = {
  response: CommitsSelectorTestQuery$data;
  variables: CommitsSelectorTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "pullRequestId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pullRequestId"
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
  "type": "GitObjectID"
},
v6 = {
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
    "name": "CommitsSelectorTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "CommitsSelector_pullRequest"
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
    "name": "CommitsSelectorTestQuery",
    "selections": [
      {
        "alias": "pullRequest",
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
                "name": "baseRefOid",
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 100
                  }
                ],
                "concreteType": "PullRequestCommitConnection",
                "kind": "LinkedField",
                "name": "commits",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PullRequestCommitEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "PullRequestCommit",
                        "kind": "LinkedField",
                        "name": "node",
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
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "committedDate",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "messageHeadline",
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
                                "concreteType": "GitActor",
                                "kind": "LinkedField",
                                "name": "author",
                                "plural": false,
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
                                        "alias": null,
                                        "args": null,
                                        "kind": "ScalarField",
                                        "name": "login",
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
                          },
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "commits(first:100)"
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          },
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "069aa6a233deb3ed97d10831800ce315",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v4/*: any*/),
        "pullRequest.baseRefOid": (v5/*: any*/),
        "pullRequest.commits": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestCommitConnection"
        },
        "pullRequest.commits.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "PullRequestCommitEdge"
        },
        "pullRequest.commits.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestCommit"
        },
        "pullRequest.commits.edges.node.commit": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Commit"
        },
        "pullRequest.commits.edges.node.commit.abbreviatedOid": (v4/*: any*/),
        "pullRequest.commits.edges.node.commit.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "GitActor"
        },
        "pullRequest.commits.edges.node.commit.author.actor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "pullRequest.commits.edges.node.commit.author.actor.__typename": (v4/*: any*/),
        "pullRequest.commits.edges.node.commit.author.actor.id": (v6/*: any*/),
        "pullRequest.commits.edges.node.commit.author.actor.login": (v4/*: any*/),
        "pullRequest.commits.edges.node.commit.committedDate": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequest.commits.edges.node.commit.id": (v6/*: any*/),
        "pullRequest.commits.edges.node.commit.messageHeadline": (v4/*: any*/),
        "pullRequest.commits.edges.node.commit.oid": (v5/*: any*/),
        "pullRequest.commits.edges.node.id": (v6/*: any*/),
        "pullRequest.id": (v6/*: any*/)
      }
    },
    "name": "CommitsSelectorTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "b8e365e703cd914ba02a959361f2830a";

export default node;

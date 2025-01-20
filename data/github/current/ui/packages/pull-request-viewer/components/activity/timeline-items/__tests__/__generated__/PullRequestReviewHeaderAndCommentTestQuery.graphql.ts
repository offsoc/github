/**
 * @generated SignedSource<<541040eb7293f1bc982d68d6d498bef7>>
 * @relayHash f75807faed5fd2c0bcfb517b3163c3b3
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f75807faed5fd2c0bcfb517b3163c3b3

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PullRequestReviewHeaderAndCommentTestQuery$variables = {
  pullRequestReviewId: string;
};
export type PullRequestReviewHeaderAndCommentTestQuery$data = {
  readonly pullRequestReview: {
    readonly " $fragmentSpreads": FragmentRefs<"PullRequestReviewHeaderAndComment_pullRequestReview">;
  } | null | undefined;
};
export type PullRequestReviewHeaderAndCommentTestQuery = {
  response: PullRequestReviewHeaderAndCommentTestQuery$data;
  variables: PullRequestReviewHeaderAndCommentTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "pullRequestReviewId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pullRequestReviewId"
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v7 = [
  (v4/*: any*/)
],
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v12 = [
  "APPROVED",
  "CHANGES_REQUESTED",
  "COMMENTED",
  "DISMISSED",
  "PENDING"
],
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Int"
},
v14 = {
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
    "name": "PullRequestReviewHeaderAndCommentTestQuery",
    "selections": [
      {
        "alias": "pullRequestReview",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "PullRequestReviewHeaderAndComment_pullRequestReview"
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
    "name": "PullRequestReviewHeaderAndCommentTestQuery",
    "selections": [
      {
        "alias": "pullRequestReview",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
                "concreteType": null,
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
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
                  (v4/*: any*/),
                  {
                    "kind": "TypeDiscriminator",
                    "abstractKey": "__isActor"
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "authorAssociation",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bodyHTML",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bodyText",
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
                "concreteType": "PullRequest",
                "kind": "LinkedField",
                "name": "pullRequest",
                "plural": false,
                "selections": [
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
                      (v2/*: any*/),
                      (v4/*: any*/),
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v3/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": [
                  {
                    "kind": "Literal",
                    "name": "first",
                    "value": 10
                  }
                ],
                "concreteType": "TeamConnection",
                "kind": "LinkedField",
                "name": "onBehalfOf",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "TeamEdge",
                    "kind": "LinkedField",
                    "name": "edges",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Team",
                        "kind": "LinkedField",
                        "name": "node",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Organization",
                            "kind": "LinkedField",
                            "name": "organization",
                            "plural": false,
                            "selections": [
                              (v5/*: any*/),
                              (v3/*: any*/)
                            ],
                            "storageKey": null
                          },
                          (v5/*: any*/),
                          (v6/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "onBehalfOf(first:10)"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "repository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isPrivate",
                    "storageKey": null
                  },
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "owner",
                    "plural": false,
                    "selections": [
                      (v2/*: any*/),
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v6/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dismissedReviewState",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "state",
                "storageKey": null
              },
              (v6/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanDelete",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUpdate",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanReport",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanReportToMaintainer",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanBlockFromOrg",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanUnblockFromOrg",
                "storageKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "viewerCanReadUserContentEdits",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "lastEditedAt",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "UserContentEdit",
                    "kind": "LinkedField",
                    "name": "lastUserContentEdit",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "editor",
                        "plural": false,
                        "selections": [
                          (v2/*: any*/),
                          (v6/*: any*/),
                          (v4/*: any*/),
                          (v3/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Comment",
                "abstractKey": "__isComment"
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "ReactionGroup",
                    "kind": "LinkedField",
                    "name": "reactionGroups",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "content",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": [
                          {
                            "kind": "Literal",
                            "name": "first",
                            "value": 5
                          }
                        ],
                        "concreteType": "ReactorConnection",
                        "kind": "LinkedField",
                        "name": "reactors",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "nodes",
                            "plural": true,
                            "selections": [
                              (v2/*: any*/),
                              {
                                "kind": "InlineFragment",
                                "selections": (v7/*: any*/),
                                "type": "User",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v7/*: any*/),
                                "type": "Bot",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v7/*: any*/),
                                "type": "Organization",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v7/*: any*/),
                                "type": "Mannequin",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": [
                                  (v3/*: any*/)
                                ],
                                "type": "Node",
                                "abstractKey": "__isNode"
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "totalCount",
                            "storageKey": null
                          }
                        ],
                        "storageKey": "reactors(first:5)"
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "viewerHasReacted",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "type": "Reactable",
                "abstractKey": "__isReactable"
              }
            ],
            "type": "PullRequestReview",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "f75807faed5fd2c0bcfb517b3163c3b3",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequestReview": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequestReview.__isComment": (v8/*: any*/),
        "pullRequestReview.__isReactable": (v8/*: any*/),
        "pullRequestReview.__typename": (v8/*: any*/),
        "pullRequestReview.author": (v9/*: any*/),
        "pullRequestReview.author.__isActor": (v8/*: any*/),
        "pullRequestReview.author.__typename": (v8/*: any*/),
        "pullRequestReview.author.avatarUrl": (v10/*: any*/),
        "pullRequestReview.author.id": (v11/*: any*/),
        "pullRequestReview.author.login": (v8/*: any*/),
        "pullRequestReview.authorAssociation": {
          "enumValues": [
            "COLLABORATOR",
            "CONTRIBUTOR",
            "FIRST_TIMER",
            "FIRST_TIME_CONTRIBUTOR",
            "MANNEQUIN",
            "MEMBER",
            "NONE",
            "OWNER"
          ],
          "nullable": false,
          "plural": false,
          "type": "CommentAuthorAssociation"
        },
        "pullRequestReview.bodyHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "pullRequestReview.bodyText": (v8/*: any*/),
        "pullRequestReview.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequestReview.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "pullRequestReview.dismissedReviewState": {
          "enumValues": (v12/*: any*/),
          "nullable": true,
          "plural": false,
          "type": "PullRequestReviewState"
        },
        "pullRequestReview.id": (v11/*: any*/),
        "pullRequestReview.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequestReview.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "pullRequestReview.lastUserContentEdit.editor": (v9/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.__typename": (v8/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.id": (v11/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.login": (v8/*: any*/),
        "pullRequestReview.lastUserContentEdit.editor.url": (v10/*: any*/),
        "pullRequestReview.lastUserContentEdit.id": (v11/*: any*/),
        "pullRequestReview.onBehalfOf": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "TeamConnection"
        },
        "pullRequestReview.onBehalfOf.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "TeamEdge"
        },
        "pullRequestReview.onBehalfOf.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Team"
        },
        "pullRequestReview.onBehalfOf.edges.node.id": (v11/*: any*/),
        "pullRequestReview.onBehalfOf.edges.node.name": (v8/*: any*/),
        "pullRequestReview.onBehalfOf.edges.node.organization": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Organization"
        },
        "pullRequestReview.onBehalfOf.edges.node.organization.id": (v11/*: any*/),
        "pullRequestReview.onBehalfOf.edges.node.organization.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "pullRequestReview.onBehalfOf.edges.node.url": (v10/*: any*/),
        "pullRequestReview.pullRequest": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequest"
        },
        "pullRequestReview.pullRequest.author": (v9/*: any*/),
        "pullRequestReview.pullRequest.author.__typename": (v8/*: any*/),
        "pullRequestReview.pullRequest.author.id": (v11/*: any*/),
        "pullRequestReview.pullRequest.author.login": (v8/*: any*/),
        "pullRequestReview.pullRequest.id": (v11/*: any*/),
        "pullRequestReview.pullRequest.number": (v13/*: any*/),
        "pullRequestReview.reactionGroups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReactionGroup"
        },
        "pullRequestReview.reactionGroups.content": {
          "enumValues": [
            "CONFUSED",
            "EYES",
            "HEART",
            "HOORAY",
            "LAUGH",
            "ROCKET",
            "THUMBS_DOWN",
            "THUMBS_UP"
          ],
          "nullable": false,
          "plural": false,
          "type": "ReactionContent"
        },
        "pullRequestReview.reactionGroups.reactors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReactorConnection"
        },
        "pullRequestReview.reactionGroups.reactors.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Reactor"
        },
        "pullRequestReview.reactionGroups.reactors.nodes.__isNode": (v8/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes.__typename": (v8/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes.id": (v11/*: any*/),
        "pullRequestReview.reactionGroups.reactors.nodes.login": (v8/*: any*/),
        "pullRequestReview.reactionGroups.reactors.totalCount": (v13/*: any*/),
        "pullRequestReview.reactionGroups.viewerHasReacted": (v14/*: any*/),
        "pullRequestReview.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "pullRequestReview.repository.id": (v11/*: any*/),
        "pullRequestReview.repository.isPrivate": (v14/*: any*/),
        "pullRequestReview.repository.name": (v8/*: any*/),
        "pullRequestReview.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "pullRequestReview.repository.owner.__typename": (v8/*: any*/),
        "pullRequestReview.repository.owner.id": (v11/*: any*/),
        "pullRequestReview.repository.owner.login": (v8/*: any*/),
        "pullRequestReview.repository.owner.url": (v10/*: any*/),
        "pullRequestReview.state": {
          "enumValues": (v12/*: any*/),
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewState"
        },
        "pullRequestReview.url": (v10/*: any*/),
        "pullRequestReview.viewerCanBlockFromOrg": (v14/*: any*/),
        "pullRequestReview.viewerCanDelete": (v14/*: any*/),
        "pullRequestReview.viewerCanReadUserContentEdits": (v14/*: any*/),
        "pullRequestReview.viewerCanReport": (v14/*: any*/),
        "pullRequestReview.viewerCanReportToMaintainer": (v14/*: any*/),
        "pullRequestReview.viewerCanUnblockFromOrg": (v14/*: any*/),
        "pullRequestReview.viewerCanUpdate": (v14/*: any*/)
      }
    },
    "name": "PullRequestReviewHeaderAndCommentTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "9f60a774dca83e19d48adc3e52b3eafe";

export default node;

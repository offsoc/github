/**
 * @generated SignedSource<<175885403b4ae23bb36a28cf4c9487b8>>
 * @relayHash ff3ad8237a65c59c7c9fb3ff15c330e2
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID ff3ad8237a65c59c7c9fb3ff15c330e2

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReviewCommentTestQuery$variables = {
  pullRequestReviewId: string;
};
export type ReviewCommentTestQuery$data = {
  readonly pullRequestReviewComment: {
    readonly " $fragmentSpreads": FragmentRefs<"ReviewComment_pullRequestReviewComment">;
  } | null | undefined;
};
export type ReviewCommentTestQuery = {
  response: ReviewCommentTestQuery$data;
  variables: ReviewCommentTestQuery$variables;
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
  "name": "url",
  "storageKey": null
},
v6 = [
  (v4/*: any*/)
],
v7 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Actor"
},
v9 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v11 = {
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
v12 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "URI"
},
v13 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v14 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "DateTime"
},
v15 = {
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
    "name": "ReviewCommentTestQuery",
    "selections": [
      {
        "alias": "pullRequestReviewComment",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReviewComment_pullRequestReviewComment"
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
    "name": "ReviewCommentTestQuery",
    "selections": [
      {
        "alias": "pullRequestReviewComment",
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
                "name": "currentDiffResourcePath",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "path",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestThread",
                "kind": "LinkedField",
                "name": "pullRequestThread",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isOutdated",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isResolved",
                    "storageKey": null
                  }
                ],
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
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "avatarUrl",
                    "storageKey": null
                  },
                  (v3/*: any*/),
                  (v4/*: any*/),
                  (v5/*: any*/)
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
                "name": "body",
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
              },
              {
                "alias": "isHidden",
                "args": null,
                "kind": "ScalarField",
                "name": "isMinimized",
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
                      (v4/*: any*/),
                      (v5/*: any*/),
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
                "args": null,
                "kind": "ScalarField",
                "name": "minimizedReason",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "publishedAt",
                "storageKey": null
              },
              {
                "alias": "reference",
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
                      (v2/*: any*/),
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v5/*: any*/)
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
                "name": "state",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "subjectType",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerDidAuthor",
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
                "name": "viewerCanMinimize",
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
                "name": "viewerCanSeeMinimizeButton",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanSeeUnminimizeButton",
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
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerRelationship",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "stafftoolsUrl",
                "storageKey": null
              },
              (v5/*: any*/),
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
                                "selections": (v6/*: any*/),
                                "type": "User",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v6/*: any*/),
                                "type": "Bot",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v6/*: any*/),
                                "type": "Organization",
                                "abstractKey": null
                              },
                              {
                                "kind": "InlineFragment",
                                "selections": (v6/*: any*/),
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
                  }
                ],
                "type": "Comment",
                "abstractKey": "__isComment"
              }
            ],
            "type": "PullRequestReviewComment",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "ff3ad8237a65c59c7c9fb3ff15c330e2",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequestReviewComment": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequestReviewComment.__isComment": (v7/*: any*/),
        "pullRequestReviewComment.__isReactable": (v7/*: any*/),
        "pullRequestReviewComment.__typename": (v7/*: any*/),
        "pullRequestReviewComment.author": (v8/*: any*/),
        "pullRequestReviewComment.author.__typename": (v7/*: any*/),
        "pullRequestReviewComment.author.avatarUrl": (v9/*: any*/),
        "pullRequestReviewComment.author.id": (v10/*: any*/),
        "pullRequestReviewComment.author.login": (v7/*: any*/),
        "pullRequestReviewComment.author.url": (v9/*: any*/),
        "pullRequestReviewComment.authorAssociation": (v11/*: any*/),
        "pullRequestReviewComment.body": (v7/*: any*/),
        "pullRequestReviewComment.bodyHTML": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "HTML"
        },
        "pullRequestReviewComment.createdAt": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequestReviewComment.currentDiffResourcePath": (v12/*: any*/),
        "pullRequestReviewComment.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "pullRequestReviewComment.id": (v10/*: any*/),
        "pullRequestReviewComment.isHidden": (v13/*: any*/),
        "pullRequestReviewComment.lastEditedAt": (v14/*: any*/),
        "pullRequestReviewComment.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "pullRequestReviewComment.lastUserContentEdit.editor": (v8/*: any*/),
        "pullRequestReviewComment.lastUserContentEdit.editor.__typename": (v7/*: any*/),
        "pullRequestReviewComment.lastUserContentEdit.editor.id": (v10/*: any*/),
        "pullRequestReviewComment.lastUserContentEdit.editor.login": (v7/*: any*/),
        "pullRequestReviewComment.lastUserContentEdit.editor.url": (v9/*: any*/),
        "pullRequestReviewComment.lastUserContentEdit.id": (v10/*: any*/),
        "pullRequestReviewComment.minimizedReason": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "pullRequestReviewComment.path": (v7/*: any*/),
        "pullRequestReviewComment.publishedAt": (v14/*: any*/),
        "pullRequestReviewComment.pullRequestThread": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "PullRequestThread"
        },
        "pullRequestReviewComment.pullRequestThread.id": (v10/*: any*/),
        "pullRequestReviewComment.pullRequestThread.isOutdated": (v13/*: any*/),
        "pullRequestReviewComment.pullRequestThread.isResolved": (v13/*: any*/),
        "pullRequestReviewComment.reactionGroups": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "ReactionGroup"
        },
        "pullRequestReviewComment.reactionGroups.content": {
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
        "pullRequestReviewComment.reactionGroups.reactors": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ReactorConnection"
        },
        "pullRequestReviewComment.reactionGroups.reactors.nodes": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "Reactor"
        },
        "pullRequestReviewComment.reactionGroups.reactors.nodes.__isNode": (v7/*: any*/),
        "pullRequestReviewComment.reactionGroups.reactors.nodes.__typename": (v7/*: any*/),
        "pullRequestReviewComment.reactionGroups.reactors.nodes.id": (v10/*: any*/),
        "pullRequestReviewComment.reactionGroups.reactors.nodes.login": (v7/*: any*/),
        "pullRequestReviewComment.reactionGroups.reactors.totalCount": (v15/*: any*/),
        "pullRequestReviewComment.reactionGroups.viewerHasReacted": (v13/*: any*/),
        "pullRequestReviewComment.reference": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequest"
        },
        "pullRequestReviewComment.reference.author": (v8/*: any*/),
        "pullRequestReviewComment.reference.author.__typename": (v7/*: any*/),
        "pullRequestReviewComment.reference.author.id": (v10/*: any*/),
        "pullRequestReviewComment.reference.author.login": (v7/*: any*/),
        "pullRequestReviewComment.reference.id": (v10/*: any*/),
        "pullRequestReviewComment.reference.number": (v15/*: any*/),
        "pullRequestReviewComment.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "pullRequestReviewComment.repository.id": (v10/*: any*/),
        "pullRequestReviewComment.repository.isPrivate": (v13/*: any*/),
        "pullRequestReviewComment.repository.name": (v7/*: any*/),
        "pullRequestReviewComment.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "pullRequestReviewComment.repository.owner.__typename": (v7/*: any*/),
        "pullRequestReviewComment.repository.owner.id": (v10/*: any*/),
        "pullRequestReviewComment.repository.owner.login": (v7/*: any*/),
        "pullRequestReviewComment.repository.owner.url": (v9/*: any*/),
        "pullRequestReviewComment.stafftoolsUrl": (v12/*: any*/),
        "pullRequestReviewComment.state": {
          "enumValues": [
            "PENDING",
            "SUBMITTED"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewCommentState"
        },
        "pullRequestReviewComment.subjectType": {
          "enumValues": [
            "FILE",
            "LINE"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestReviewThreadSubjectType"
        },
        "pullRequestReviewComment.url": (v9/*: any*/),
        "pullRequestReviewComment.viewerCanBlockFromOrg": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanDelete": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanMinimize": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanReadUserContentEdits": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanReport": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanReportToMaintainer": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanSeeMinimizeButton": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanSeeUnminimizeButton": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanUnblockFromOrg": (v13/*: any*/),
        "pullRequestReviewComment.viewerCanUpdate": (v13/*: any*/),
        "pullRequestReviewComment.viewerDidAuthor": (v13/*: any*/),
        "pullRequestReviewComment.viewerRelationship": (v11/*: any*/)
      }
    },
    "name": "ReviewCommentTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ab3bdfba7c3305ad52b879650251068e";

export default node;

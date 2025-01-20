/**
 * @generated SignedSource<<8f5ca164c730cc9241c6116952d9a160>>
 * @relayHash 732bc793056ea265e89686e93af244f1
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 732bc793056ea265e89686e93af244f1

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueCommentHeaderNodeTestQuery$variables = {
  commentId: string;
};
export type IssueCommentHeaderNodeTestQuery$data = {
  readonly comment: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueCommentHeader">;
  } | null | undefined;
};
export type IssueCommentHeaderNodeTestQuery = {
  response: IssueCommentHeaderNodeTestQuery$data;
  variables: IssueCommentHeaderNodeTestQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "commentId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "commentId"
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
  "name": "url",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "login",
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
  "nullable": true,
  "plural": false,
  "type": "Actor"
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
  "type": "DateTime"
},
v11 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "Boolean"
},
v12 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "URI"
},
v13 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v14 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Boolean"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "IssueCommentHeaderNodeTestQuery",
    "selections": [
      {
        "alias": "comment",
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
                "args": null,
                "kind": "FragmentSpread",
                "name": "IssueCommentHeader"
              }
            ],
            "type": "Comment",
            "abstractKey": "__isComment"
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
    "name": "IssueCommentHeaderNodeTestQuery",
    "selections": [
      {
        "alias": "comment",
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
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "databaseId",
                    "storageKey": null
                  },
                  (v4/*: any*/),
                  (v5/*: any*/),
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
                    "name": "authorAssociation",
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
                    "name": "viewerCanDelete",
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
                    "alias": "isHidden",
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isMinimized",
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
                    "name": "createdViaEmail",
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
                    "concreteType": "Sponsorship",
                    "kind": "LinkedField",
                    "name": "authorToRepoOwnerSponsorship",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "isActive",
                        "storageKey": null
                      },
                      (v3/*: any*/)
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
                      (v3/*: any*/),
                      (v6/*: any*/)
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
                          (v6/*: any*/),
                          (v4/*: any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "isPrivate",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Issue",
                    "kind": "LinkedField",
                    "name": "issue",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "number",
                        "storageKey": null
                      },
                      (v3/*: any*/)
                    ],
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
                              (v4/*: any*/),
                              (v6/*: any*/),
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
                    "kind": "ClientExtension",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pendingMinimizeReason",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pendingBlock",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pendingUnblock",
                        "storageKey": null
                      }
                    ]
                  }
                ],
                "type": "IssueComment",
                "abstractKey": null
              }
            ],
            "type": "Comment",
            "abstractKey": "__isComment"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "732bc793056ea265e89686e93af244f1",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "comment": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "comment.__isComment": (v7/*: any*/),
        "comment.__typename": (v7/*: any*/),
        "comment.author": (v8/*: any*/),
        "comment.author.__typename": (v7/*: any*/),
        "comment.author.id": (v9/*: any*/),
        "comment.author.login": (v7/*: any*/),
        "comment.authorAssociation": {
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
        "comment.authorToRepoOwnerSponsorship": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Sponsorship"
        },
        "comment.authorToRepoOwnerSponsorship.createdAt": (v10/*: any*/),
        "comment.authorToRepoOwnerSponsorship.id": (v9/*: any*/),
        "comment.authorToRepoOwnerSponsorship.isActive": (v11/*: any*/),
        "comment.body": (v7/*: any*/),
        "comment.createdAt": (v10/*: any*/),
        "comment.createdViaEmail": (v11/*: any*/),
        "comment.databaseId": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Int"
        },
        "comment.id": (v9/*: any*/),
        "comment.isHidden": (v11/*: any*/),
        "comment.issue": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Issue"
        },
        "comment.issue.id": (v9/*: any*/),
        "comment.issue.number": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        },
        "comment.lastEditedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "comment.lastUserContentEdit": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "UserContentEdit"
        },
        "comment.lastUserContentEdit.editor": (v8/*: any*/),
        "comment.lastUserContentEdit.editor.__typename": (v7/*: any*/),
        "comment.lastUserContentEdit.editor.id": (v9/*: any*/),
        "comment.lastUserContentEdit.editor.login": (v7/*: any*/),
        "comment.lastUserContentEdit.editor.url": (v12/*: any*/),
        "comment.lastUserContentEdit.id": (v9/*: any*/),
        "comment.minimizedReason": (v13/*: any*/),
        "comment.pendingBlock": (v14/*: any*/),
        "comment.pendingMinimizeReason": (v13/*: any*/),
        "comment.pendingUnblock": (v14/*: any*/),
        "comment.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "comment.repository.id": (v9/*: any*/),
        "comment.repository.isPrivate": (v11/*: any*/),
        "comment.repository.name": (v7/*: any*/),
        "comment.repository.owner": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "RepositoryOwner"
        },
        "comment.repository.owner.__typename": (v7/*: any*/),
        "comment.repository.owner.id": (v9/*: any*/),
        "comment.repository.owner.login": (v7/*: any*/),
        "comment.repository.owner.url": (v12/*: any*/),
        "comment.url": (v12/*: any*/),
        "comment.viewerCanBlockFromOrg": (v11/*: any*/),
        "comment.viewerCanDelete": (v11/*: any*/),
        "comment.viewerCanMinimize": (v11/*: any*/),
        "comment.viewerCanReadUserContentEdits": (v11/*: any*/),
        "comment.viewerCanReport": (v11/*: any*/),
        "comment.viewerCanReportToMaintainer": (v11/*: any*/),
        "comment.viewerCanUnblockFromOrg": (v11/*: any*/),
        "comment.viewerCanUpdate": (v11/*: any*/),
        "comment.viewerDidAuthor": (v11/*: any*/)
      }
    },
    "name": "IssueCommentHeaderNodeTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "3ce19270e37a0a7a8032db998f0efb55";

export default node;

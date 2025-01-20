/**
 * @generated SignedSource<<0d8e5808f567012799139a19eed66bc5>>
 * @relayHash f925addf58356efdbb54eff5c922647b
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID f925addf58356efdbb54eff5c922647b

import { ConcreteRequest, Query } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type HeaderBranchInfoTestQuery$variables = {
  pullRequestId: string;
};
export type HeaderBranchInfoTestQuery$data = {
  readonly pullRequest: {
    readonly " $fragmentSpreads": FragmentRefs<"HeaderBranchInfo_pullRequest">;
  } | null | undefined;
};
export type HeaderBranchInfoTestQuery = {
  response: HeaderBranchInfoTestQuery$data;
  variables: HeaderBranchInfoTestQuery$variables;
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
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
  (v2/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "login",
    "storageKey": null
  },
  (v4/*: any*/)
],
v6 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": (v5/*: any*/),
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
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Ref"
},
v10 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "RepositoryOwner"
},
v11 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Repository"
},
v12 = {
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
    "name": "HeaderBranchInfoTestQuery",
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
            "kind": "InlineFragment",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "HeaderBranchInfo_pullRequest"
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
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
    "name": "HeaderBranchInfoTestQuery",
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
                "name": "mergedAt",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "baseRefName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Ref",
                "kind": "LinkedField",
                "name": "baseRef",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Repository",
                    "kind": "LinkedField",
                    "name": "repository",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "defaultBranch",
                        "storageKey": null
                      },
                      (v3/*: any*/),
                      (v6/*: any*/),
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
                "name": "headRefName",
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
                "concreteType": "PullRequestCommitConnection",
                "kind": "LinkedField",
                "name": "commits",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "totalCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "baseRepository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  (v6/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Ref",
                    "kind": "LinkedField",
                    "name": "defaultBranchRef",
                    "plural": false,
                    "selections": [
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
                "concreteType": "Repository",
                "kind": "LinkedField",
                "name": "headRepository",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isFork",
                    "storageKey": null
                  },
                  (v6/*: any*/),
                  (v4/*: any*/)
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
                "selections": (v5/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "viewerCanChangeBaseBranch",
                "storageKey": null
              }
            ],
            "type": "PullRequest",
            "abstractKey": null
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "f925addf58356efdbb54eff5c922647b",
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "pullRequest": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "pullRequest.__typename": (v7/*: any*/),
        "pullRequest.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "pullRequest.author.__typename": (v7/*: any*/),
        "pullRequest.author.id": (v8/*: any*/),
        "pullRequest.author.login": (v7/*: any*/),
        "pullRequest.baseRef": (v9/*: any*/),
        "pullRequest.baseRef.id": (v8/*: any*/),
        "pullRequest.baseRef.repository": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Repository"
        },
        "pullRequest.baseRef.repository.defaultBranch": (v7/*: any*/),
        "pullRequest.baseRef.repository.id": (v8/*: any*/),
        "pullRequest.baseRef.repository.name": (v7/*: any*/),
        "pullRequest.baseRef.repository.owner": (v10/*: any*/),
        "pullRequest.baseRef.repository.owner.__typename": (v7/*: any*/),
        "pullRequest.baseRef.repository.owner.id": (v8/*: any*/),
        "pullRequest.baseRef.repository.owner.login": (v7/*: any*/),
        "pullRequest.baseRefName": (v7/*: any*/),
        "pullRequest.baseRepository": (v11/*: any*/),
        "pullRequest.baseRepository.defaultBranchRef": (v9/*: any*/),
        "pullRequest.baseRepository.defaultBranchRef.id": (v8/*: any*/),
        "pullRequest.baseRepository.defaultBranchRef.name": (v7/*: any*/),
        "pullRequest.baseRepository.id": (v8/*: any*/),
        "pullRequest.baseRepository.name": (v7/*: any*/),
        "pullRequest.baseRepository.owner": (v10/*: any*/),
        "pullRequest.baseRepository.owner.__typename": (v7/*: any*/),
        "pullRequest.baseRepository.owner.id": (v8/*: any*/),
        "pullRequest.baseRepository.owner.login": (v7/*: any*/),
        "pullRequest.commits": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "PullRequestCommitConnection"
        },
        "pullRequest.commits.totalCount": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "Int"
        },
        "pullRequest.headRefName": (v7/*: any*/),
        "pullRequest.headRepository": (v11/*: any*/),
        "pullRequest.headRepository.id": (v8/*: any*/),
        "pullRequest.headRepository.isFork": (v12/*: any*/),
        "pullRequest.headRepository.name": (v7/*: any*/),
        "pullRequest.headRepository.owner": (v10/*: any*/),
        "pullRequest.headRepository.owner.__typename": (v7/*: any*/),
        "pullRequest.headRepository.owner.id": (v8/*: any*/),
        "pullRequest.headRepository.owner.login": (v7/*: any*/),
        "pullRequest.id": (v8/*: any*/),
        "pullRequest.mergedAt": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "DateTime"
        },
        "pullRequest.state": {
          "enumValues": [
            "CLOSED",
            "MERGED",
            "OPEN"
          ],
          "nullable": false,
          "plural": false,
          "type": "PullRequestState"
        },
        "pullRequest.viewerCanChangeBaseBranch": (v12/*: any*/)
      }
    },
    "name": "HeaderBranchInfoTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "ec87136432aaaa98d33025239903ab41";

export default node;

/**
 * @generated SignedSource<<e33c7b208bf27c71fa697f02b8f795e0>>
 * @relayHash d821d9ea1c116ca7284a231f03813357
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID d821d9ea1c116ca7284a231f03813357

import { ConcreteRequest, Query } from 'relay-runtime';
export type FileViewedState = "DISMISSED" | "UNVIEWED" | "VIEWED" | "%future added value";
export type FileFilterQuery$variables = {
  endOid?: string | null | undefined;
  number: number;
  owner: string;
  repo: string;
  singleCommitOid?: string | null | undefined;
  startOid?: string | null | undefined;
};
export type FileFilterQuery$data = {
  readonly repository: {
    readonly pullRequest: {
      readonly comparison: {
        readonly summary: ReadonlyArray<{
          readonly path: string;
          readonly pathDigest: string;
          readonly pathOwnership: {
            readonly isOwnedByViewer: boolean;
          };
          readonly viewerViewedState: FileViewedState | null | undefined;
        }> | null | undefined;
      } | null | undefined;
    } | null | undefined;
  } | null | undefined;
};
export type FileFilterQuery = {
  response: FileFilterQuery$data;
  variables: FileFilterQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "endOid"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "number"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "owner"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "repo"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "singleCommitOid"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "startOid"
},
v6 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "repo"
  },
  {
    "kind": "Variable",
    "name": "owner",
    "variableName": "owner"
  }
],
v7 = [
  {
    "kind": "Variable",
    "name": "number",
    "variableName": "number"
  }
],
v8 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "endOid",
      "variableName": "endOid"
    },
    {
      "kind": "Variable",
      "name": "singleCommitOid",
      "variableName": "singleCommitOid"
    },
    {
      "kind": "Variable",
      "name": "startOid",
      "variableName": "startOid"
    }
  ],
  "concreteType": "PullRequestComparison",
  "kind": "LinkedField",
  "name": "comparison",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "PullRequestSummaryDelta",
      "kind": "LinkedField",
      "name": "summary",
      "plural": true,
      "selections": [
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
          "kind": "ScalarField",
          "name": "pathDigest",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PathOwnership",
          "kind": "LinkedField",
          "name": "pathOwnership",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "isOwnedByViewer",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "viewerViewedState",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "FileFilterQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v7/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v8/*: any*/)
            ],
            "storageKey": null
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
    "argumentDefinitions": [
      (v2/*: any*/),
      (v3/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/),
      (v0/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "FileFilterQuery",
    "selections": [
      {
        "alias": null,
        "args": (v6/*: any*/),
        "concreteType": "Repository",
        "kind": "LinkedField",
        "name": "repository",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v7/*: any*/),
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v8/*: any*/),
              (v9/*: any*/)
            ],
            "storageKey": null
          },
          (v9/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "d821d9ea1c116ca7284a231f03813357",
    "metadata": {},
    "name": "FileFilterQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

(node as any).hash = "67673c7a023faaf0a351c19385357492";

export default node;

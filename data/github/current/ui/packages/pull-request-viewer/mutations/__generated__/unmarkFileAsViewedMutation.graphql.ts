/**
 * @generated SignedSource<<7491fcd84cb2b16863a9a0c4a8bf2c45>>
 * @relayHash fc88c28f26f5c30399ecab53dad256c7
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID fc88c28f26f5c30399ecab53dad256c7

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FileViewedState = "DISMISSED" | "UNVIEWED" | "VIEWED" | "%future added value";
export type unmarkFileAsViewedMutation$variables = {
  id: string;
  path: string;
};
export type unmarkFileAsViewedMutation$data = {
  readonly unmarkFileAsViewed: {
    readonly pullRequest: {
      readonly comparison: {
        readonly diffEntry: {
          readonly viewerViewedState: FileViewedState | null | undefined;
        };
      } | null | undefined;
      readonly viewerViewedFiles: number;
    } | null | undefined;
  } | null | undefined;
};
export type unmarkFileAsViewedMutation$rawResponse = {
  readonly unmarkFileAsViewed: {
    readonly pullRequest: {
      readonly comparison: {
        readonly diffEntry: {
          readonly id: string;
          readonly viewerViewedState: FileViewedState | null | undefined;
        };
      } | null | undefined;
      readonly id: string;
      readonly viewerViewedFiles: number;
    } | null | undefined;
  } | null | undefined;
};
export type unmarkFileAsViewedMutation = {
  rawResponse: unmarkFileAsViewedMutation$rawResponse;
  response: unmarkFileAsViewedMutation$data;
  variables: unmarkFileAsViewedMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "path"
  }
],
v1 = {
  "kind": "Variable",
  "name": "path",
  "variableName": "path"
},
v2 = [
  {
    "fields": [
      (v1/*: any*/),
      {
        "kind": "Variable",
        "name": "pullRequestId",
        "variableName": "id"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerViewedFiles",
  "storageKey": null
},
v4 = [
  (v1/*: any*/)
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "viewerViewedState",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "unmarkFileAsViewedMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "UnmarkFileAsViewedPayload",
        "kind": "LinkedField",
        "name": "unmarkFileAsViewed",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v4/*: any*/),
                    "concreteType": "PullRequestDiffEntry",
                    "kind": "LinkedField",
                    "name": "diffEntry",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/)
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
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "unmarkFileAsViewedMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "UnmarkFileAsViewedPayload",
        "kind": "LinkedField",
        "name": "unmarkFileAsViewed",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "PullRequest",
            "kind": "LinkedField",
            "name": "pullRequest",
            "plural": false,
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "PullRequestComparison",
                "kind": "LinkedField",
                "name": "comparison",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": (v4/*: any*/),
                    "concreteType": "PullRequestDiffEntry",
                    "kind": "LinkedField",
                    "name": "diffEntry",
                    "plural": false,
                    "selections": [
                      (v5/*: any*/),
                      (v6/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              (v6/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "fc88c28f26f5c30399ecab53dad256c7",
    "metadata": {},
    "name": "unmarkFileAsViewedMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "625da0128aaaffc62f1254988554c61c";

export default node;

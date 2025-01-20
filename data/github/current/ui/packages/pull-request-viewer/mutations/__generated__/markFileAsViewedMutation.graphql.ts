/**
 * @generated SignedSource<<030978650e47234fb5f64fa34e759167>>
 * @relayHash 69eb206c1e07b3c8ca40ae90c1eeca9f
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 69eb206c1e07b3c8ca40ae90c1eeca9f

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type FileViewedState = "DISMISSED" | "UNVIEWED" | "VIEWED" | "%future added value";
export type markFileAsViewedMutation$variables = {
  id: string;
  path: string;
};
export type markFileAsViewedMutation$data = {
  readonly markFileAsViewed: {
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
export type markFileAsViewedMutation$rawResponse = {
  readonly markFileAsViewed: {
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
export type markFileAsViewedMutation = {
  rawResponse: markFileAsViewedMutation$rawResponse;
  response: markFileAsViewedMutation$data;
  variables: markFileAsViewedMutation$variables;
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
    "name": "markFileAsViewedMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "MarkFileAsViewedPayload",
        "kind": "LinkedField",
        "name": "markFileAsViewed",
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
    "name": "markFileAsViewedMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "MarkFileAsViewedPayload",
        "kind": "LinkedField",
        "name": "markFileAsViewed",
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
    "id": "69eb206c1e07b3c8ca40ae90c1eeca9f",
    "metadata": {},
    "name": "markFileAsViewedMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "bf447bd5242350e364f0d7bd328c0800";

export default node;

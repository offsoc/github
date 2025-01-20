/**
 * @generated SignedSource<<834c310ff00df9562fd29d89c656f798>>
 * @relayHash fb13205d648529a44da6255213776135
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID fb13205d648529a44da6255213776135

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type updatePreferredDiffViewMutation$variables = {
  preferredDiffView: string;
};
export type updatePreferredDiffViewMutation$data = {
  readonly updatePreferredDiffView: {
    readonly user: {
      readonly pullRequestUserPreferences: {
        readonly diffView: string;
      };
    } | null | undefined;
  } | null | undefined;
};
export type updatePreferredDiffViewMutation$rawResponse = {
  readonly updatePreferredDiffView: {
    readonly user: {
      readonly id: string;
      readonly pullRequestUserPreferences: {
        readonly diffView: string;
      };
    } | null | undefined;
  } | null | undefined;
};
export type updatePreferredDiffViewMutation = {
  rawResponse: updatePreferredDiffViewMutation$rawResponse;
  response: updatePreferredDiffViewMutation$data;
  variables: updatePreferredDiffViewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "preferredDiffView"
  }
],
v1 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "preferredDiffView",
        "variableName": "preferredDiffView"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "PullRequestUserPreferences",
  "kind": "LinkedField",
  "name": "pullRequestUserPreferences",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "diffView",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "updatePreferredDiffViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePreferredDiffViewPayload",
        "kind": "LinkedField",
        "name": "updatePreferredDiffView",
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
              (v2/*: any*/)
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
    "name": "updatePreferredDiffViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdatePreferredDiffViewPayload",
        "kind": "LinkedField",
        "name": "updatePreferredDiffView",
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
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "id": "fb13205d648529a44da6255213776135",
    "metadata": {},
    "name": "updatePreferredDiffViewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "56254ea4f4bc3a34d9eb8089f3d17f4e";

export default node;

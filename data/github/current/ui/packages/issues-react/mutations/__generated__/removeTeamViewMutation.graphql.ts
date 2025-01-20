/**
 * @generated SignedSource<<abaa25de56bf84726089ece29aa56484>>
 * @relayHash 01ba2647727ea5877eff4595e869734d
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 01ba2647727ea5877eff4595e869734d

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type RemoveTeamDashboardSearchShortcutInput = {
  clientMutationId?: string | null | undefined;
  shortcutId: string;
};
export type removeTeamViewMutation$variables = {
  input: RemoveTeamDashboardSearchShortcutInput;
};
export type removeTeamViewMutation$data = {
  readonly removeTeamDashboardSearchShortcut: {
    readonly shortcut: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type removeTeamViewMutation$rawResponse = {
  readonly removeTeamDashboardSearchShortcut: {
    readonly shortcut: {
      readonly id: string;
    } | null | undefined;
  } | null | undefined;
};
export type removeTeamViewMutation = {
  rawResponse: removeTeamViewMutation$rawResponse;
  response: removeTeamViewMutation$data;
  variables: removeTeamViewMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
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
    "name": "removeTeamViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveTeamDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "removeTeamDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TeamSearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
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
    "name": "removeTeamViewMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "RemoveTeamDashboardSearchShortcutPayload",
        "kind": "LinkedField",
        "name": "removeTeamDashboardSearchShortcut",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "TeamSearchShortcut",
            "kind": "LinkedField",
            "name": "shortcut",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "filters": null,
                "handle": "deleteRecord",
                "key": "",
                "kind": "ScalarHandle",
                "name": "id"
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
    "id": "01ba2647727ea5877eff4595e869734d",
    "metadata": {},
    "name": "removeTeamViewMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "20a1e0ee36e23bdf80577ebf4d475aaf";

export default node;

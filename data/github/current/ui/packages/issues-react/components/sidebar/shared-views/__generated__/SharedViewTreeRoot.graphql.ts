/**
 * @generated SignedSource<<1d6d383a0017108f7d1af722bc00d7eb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SharedViewTreeRoot$data = {
  readonly avatarUrl: string | null | undefined;
  readonly dashboard: {
    readonly " $fragmentSpreads": FragmentRefs<"SharedViewTree">;
  } | null | undefined;
  readonly id: string;
  readonly isViewerMember: boolean;
  readonly name: string;
  readonly organization: {
    readonly name: string | null | undefined;
  };
  readonly viewerCanAdminister: boolean;
  readonly " $fragmentSpreads": FragmentRefs<"TeamCheckboxItem">;
  readonly " $fragmentType": "SharedViewTreeRoot";
};
export type SharedViewTreeRoot$key = {
  readonly " $data"?: SharedViewTreeRoot$data;
  readonly " $fragmentSpreads": FragmentRefs<"SharedViewTreeRoot">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "searchTypes"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "teamViewPageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "SharedViewTreeRoot",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "TeamCheckboxItem"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isViewerMember",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanAdminister",
      "storageKey": null
    },
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Organization",
      "kind": "LinkedField",
      "name": "organization",
      "plural": false,
      "selections": [
        (v0/*: any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "TeamDashboard",
      "kind": "LinkedField",
      "name": "dashboard",
      "plural": false,
      "selections": [
        {
          "args": [
            {
              "kind": "Variable",
              "name": "searchTypes",
              "variableName": "searchTypes"
            },
            {
              "kind": "Variable",
              "name": "teamViewPageSize",
              "variableName": "teamViewPageSize"
            }
          ],
          "kind": "FragmentSpread",
          "name": "SharedViewTree"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Team",
  "abstractKey": null
};
})();

(node as any).hash = "99d69e1658ba9e523fb5ab6b943f383b";

export default node;

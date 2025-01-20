/**
 * @generated SignedSource<<1085e9be5d4c923b3f488a7198b869e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type useAssigneeDescription$data = {
  readonly assignees: {
    readonly nodes: ReadonlyArray<{
      readonly login: string;
    } | null | undefined> | null | undefined;
  };
  readonly " $fragmentType": "useAssigneeDescription";
};
export type useAssigneeDescription$key = {
  readonly " $data"?: useAssigneeDescription$data;
  readonly " $fragmentSpreads": FragmentRefs<"useAssigneeDescription">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "assigneePageSize"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "useAssigneeDescription",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "assigneePageSize"
        }
      ],
      "concreteType": "UserConnection",
      "kind": "LinkedField",
      "name": "assignees",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "nodes",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "login",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Assignable",
  "abstractKey": "__isAssignable"
};

(node as any).hash = "7557583255c3aea37d8e44264fdb3b27";

export default node;

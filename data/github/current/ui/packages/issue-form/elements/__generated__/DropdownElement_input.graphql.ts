/**
 * @generated SignedSource<<082c1e519acec92872681cac0260d639>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DropdownElement_input$data = {
  readonly __id: string;
  readonly defaultOptionIndex: number | null | undefined;
  readonly descriptionHTML: string | null | undefined;
  readonly label: string;
  readonly multiple: boolean | null | undefined;
  readonly options: ReadonlyArray<string>;
  readonly required: boolean | null | undefined;
  readonly " $fragmentType": "DropdownElement_input";
};
export type DropdownElement_input$key = {
  readonly " $data"?: DropdownElement_input$data;
  readonly " $fragmentSpreads": FragmentRefs<"DropdownElement_input">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DropdownElement_input",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "descriptionHTML",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "options",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "required",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "multiple",
      "storageKey": null
    },
    {
      "alias": "defaultOptionIndex",
      "args": null,
      "kind": "ScalarField",
      "name": "default",
      "storageKey": null
    },
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__id",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "IssueFormElementDropdown",
  "abstractKey": null
};

(node as any).hash = "44d51e88c97a03e4f143416f7b66ef7b";

export default node;

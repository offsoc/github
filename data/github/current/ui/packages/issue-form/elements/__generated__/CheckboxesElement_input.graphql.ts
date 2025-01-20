/**
 * @generated SignedSource<<9cd9c3bcb9eba20839fa11a4cf1195cd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CheckboxesElement_input$data = {
  readonly __id: string;
  readonly checkboxOptions: ReadonlyArray<{
    readonly label: string;
    readonly labelHTML: string;
    readonly required: boolean | null | undefined;
  }>;
  readonly descriptionHTML: string | null | undefined;
  readonly label: string;
  readonly " $fragmentType": "CheckboxesElement_input";
};
export type CheckboxesElement_input$key = {
  readonly " $data"?: CheckboxesElement_input$data;
  readonly " $fragmentSpreads": FragmentRefs<"CheckboxesElement_input">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CheckboxesElement_input",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "descriptionHTML",
      "storageKey": null
    },
    {
      "alias": "checkboxOptions",
      "args": null,
      "concreteType": "IssueFormElementCheckboxOption",
      "kind": "LinkedField",
      "name": "options",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "labelHTML",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "required",
          "storageKey": null
        }
      ],
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
  "type": "IssueFormElementCheckboxes",
  "abstractKey": null
};
})();

(node as any).hash = "6adb2197bcbe499d724fbc05a751be1d";

export default node;

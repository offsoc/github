/**
 * @generated SignedSource<<deb0371a0cc9d04ad1e76a0d7edb9759>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TextAreaElement_input$data = {
  readonly __id: string;
  readonly descriptionHTML: string | null | undefined;
  readonly itemId: string | null | undefined;
  readonly label: string;
  readonly placeholder: string | null | undefined;
  readonly render: string | null | undefined;
  readonly required: boolean | null | undefined;
  readonly value: string | null | undefined;
  readonly " $fragmentType": "TextAreaElement_input";
};
export type TextAreaElement_input$key = {
  readonly " $data"?: TextAreaElement_input$data;
  readonly " $fragmentSpreads": FragmentRefs<"TextAreaElement_input">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TextAreaElement_input",
  "selections": [
    {
      "alias": "itemId",
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
      "name": "placeholder",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "value",
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
      "name": "render",
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
  "type": "IssueFormElementTextarea",
  "abstractKey": null
};

(node as any).hash = "77263c4a3e8e6f76c8ddc25b88931e27";

export default node;

/**
 * @generated SignedSource<<453a97df6cba116c06e7c23702a2c015>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IssueTypesDialogIssueTypes$data = {
  readonly nodes: ReadonlyArray<{
    readonly color: IssueTypeColor;
    readonly description: string | null | undefined;
    readonly id: string;
    readonly isEnabled: boolean;
    readonly name: string;
  } | null | undefined> | null | undefined;
  readonly " $fragmentType": "IssueTypesDialogIssueTypes";
};
export type IssueTypesDialogIssueTypes$key = {
  readonly " $data"?: IssueTypesDialogIssueTypes$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTypesDialogIssueTypes">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTypesDialogIssueTypes",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueType",
      "kind": "LinkedField",
      "name": "nodes",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "color",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "description",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isEnabled",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "IssueTypeConnection",
  "abstractKey": null
};

(node as any).hash = "3b854a78c5ca3ee38d836bee30cca937";

export default node;

/**
 * @generated SignedSource<<daf798d433c70debce1e69c1fc350825>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type IssueTypeIndicator$data = {
  readonly issueType: {
    readonly color: IssueTypeColor;
    readonly id: string;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "IssueTypeIndicator";
};
export type IssueTypeIndicator$key = {
  readonly " $data"?: IssueTypeIndicator$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTypeIndicator">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTypeIndicator",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueType",
      "kind": "LinkedField",
      "name": "issueType",
      "plural": false,
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
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "dad417bd99b3d4b49eae2364363cde61";

export default node;

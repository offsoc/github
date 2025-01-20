/**
 * @generated SignedSource<<9e62e3e40954e6eabbf4e50292418fee>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ReactionViewerGroups$data = {
  readonly reactionGroups: ReadonlyArray<{
    readonly " $fragmentSpreads": FragmentRefs<"ReactionButton_Reaction" | "ReactionsMenuItem_Reaction">;
  }> | null | undefined;
  readonly " $fragmentType": "ReactionViewerGroups";
};
export type ReactionViewerGroups$key = {
  readonly " $data"?: ReactionViewerGroups$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReactionViewerGroups">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactionViewerGroups",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "ReactionGroup",
      "kind": "LinkedField",
      "name": "reactionGroups",
      "plural": true,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ReactionButton_Reaction"
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ReactionsMenuItem_Reaction"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Reactable",
  "abstractKey": "__isReactable"
};

(node as any).hash = "ec63064603db2ccbf5dce71da0c65acf";

export default node;

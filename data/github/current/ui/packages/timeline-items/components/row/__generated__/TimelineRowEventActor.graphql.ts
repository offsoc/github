/**
 * @generated SignedSource<<db8ac81de3631951f21984e9860af42d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type TimelineRowEventActor$data = {
  readonly " $fragmentSpreads": FragmentRefs<"EventActor">;
  readonly " $fragmentType": "TimelineRowEventActor";
};
export type TimelineRowEventActor$key = {
  readonly " $data"?: TimelineRowEventActor$data;
  readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TimelineRowEventActor",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EventActor"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

(node as any).hash = "2dc15c7f313b6ec0395f08c1257a4d96";

export default node;

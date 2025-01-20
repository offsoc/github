/**
 * @generated SignedSource<<e357d20c45b0c21620288d8a4d47abe7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type IssueSidebarLazySections$data = {
  readonly " $fragmentSpreads": FragmentRefs<"DevelopmentSectionFragment" | "ParticipantsSectionFragment" | "RelationshipsSectionFragment" | "SubscriptionSectionFragment">;
  readonly " $fragmentType": "IssueSidebarLazySections";
};
export type IssueSidebarLazySections$key = {
  readonly " $data"?: IssueSidebarLazySections$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueSidebarLazySections">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueSidebarLazySections",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DevelopmentSectionFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelationshipsSectionFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "SubscriptionSectionFragment"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "ParticipantsSectionFragment"
    }
  ],
  "type": "Issue",
  "abstractKey": null
};

(node as any).hash = "f1259743ec020fbc5ef28ca00ad3a758";

export default node;

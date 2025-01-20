/**
 * @generated SignedSource<<4f9d72629c8e68fdb94cbf9b742d264a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type RepositoryPickerRepository$data = {
  readonly codeOfConductFileUrl: string | null | undefined;
  readonly contributingFileUrl: string | null | undefined;
  readonly databaseId: number | null | undefined;
  readonly hasIssuesEnabled: boolean;
  readonly id: string;
  readonly isArchived: boolean;
  readonly isInOrganization: boolean;
  readonly isPrivate: boolean;
  readonly name: string;
  readonly nameWithOwner: string;
  readonly owner: {
    readonly avatarUrl: string;
    readonly databaseId: number | null | undefined;
    readonly login: string;
  };
  readonly planFeatures: {
    readonly maximumAssignees: number;
  };
  readonly securityPolicyUrl: string | null | undefined;
  readonly shortDescriptionHTML: string;
  readonly slashCommandsEnabled: boolean;
  readonly viewerCanPush: boolean;
  readonly viewerIssueCreationPermissions: {
    readonly assignable: boolean;
    readonly labelable: boolean;
    readonly milestoneable: boolean;
    readonly triageable: boolean;
    readonly typeable: boolean;
  };
  readonly " $fragmentType": "RepositoryPickerRepository";
};
export type RepositoryPickerRepository$key = {
  readonly " $data"?: RepositoryPickerRepository$data;
  readonly " $fragmentSpreads": FragmentRefs<"RepositoryPickerRepository">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "RepositoryPickerRepository"
};

(node as any).hash = "a5ed4ec0bf1c77bd3e90f34eb98df556";

export default node;

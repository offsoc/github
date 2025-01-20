# Memex frontend

- [Overview](#overview)
- [Technical Overview](#technical-overview)
- [Ownership](#ownership)
- [Resources](#resources)

## Overview

![memex-table-view](https://user-images.githubusercontent.com/32535/146455692-5abb1c85-080b-45ea-8806-74c764cb1831.png)

This repository holds the React app that powers the table view for Project Memex. For background on Project Memex, head to the [github/memex-crm](https://github.com/github/memex-crm) repository. To find more information about how to use the table view, check out our [internal help documentation](https://github.com/github/memex/blob/main/docs/help-docs.md).

The React client from this repository is bundled and published as the [`@github/memex-frontend` npm package](https://github.com/github/memex/packages/132831) in github registry. It is consumed from within the main Rails application (implemented in from [`github/github`](https://github.com/github/github)) to render the memex page.

What follows in this document is documentation for the React client specifically. Documentation for the memex backend can be found in [`docs/backend.md`](https://github.com/github/memex/blob/main/docs/backend.md).

## Technical Overview

Currently the memex repo consists of:

- A simple [Node.js/TypeScript webserver](./src/server-dev.ts) which serves the
  JavaScript bundles to enable usage in from monolith during local development
- A [React + TypeScript clientside application](./src/client) built with webpack
  for the application UI

## Ownership

The Memex/Projects AoR is co-owned by the [cybercats](https://github.com/github/cybercats), the [neon-alpacas](https://github.com/github/neon-alpacas), the [nifty-armadillos](https://github.com/github/nifty-armadillos), and the [null-ants](https://github.com/github/null-ants). We have a [primary](https://github.pagerduty.com/schedules#P5KHU6L) and a [secondary](https://github.pagerduty.com/schedules#P71K036/) FR each week that handle memex [release coordination](#for-release-coordinators), triage responsibilities, and other maintenance initiatives.

### PR Reviews

Because we share ownership of this codebase among several teams, we have implemented an adjusted PR review strategy. Please see [Pull Request Reviews](https://github.com/github/memex/blob/main/docs/pull_request_reviews.md) for more information.

### Guilds

As part of our shared ownership model, we've introduced the concept of guilds. We currently have a frontend guild and a backend guild.

- [Guilds overview](https://github.com/github/memex/blob/main/docs/guilds/guilds-overview.md)
- [Backend guild](https://github.com/github/memex/blob/main/docs/guilds/backend-guild.md)
- [Frontend guild](https://github.com/github/memex/blob/main/docs/guilds/frontend-guild.md)

## Resources

### Onboarding

Start with [this doc](https://github.com/github/memex/blob/main/docs/onboarding.md) if you are new to the Planning & Tracking team.

### For Contributors

This repository has embedded [codetours](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour). If you are a VScode user, install the [extension](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.codetour) and run the tour from the command palette (<kbd>⌘</kbd><kbd>⇧</kbd><kbd>p</kbd>) or the `codetour` section of the explorer sidebar.

- [Development environment setup](https://github.com/github/memex/blob/main/docs/developing-in-codespaces.md)
- [Enabled Features](https://github.com/github/memex/blob/main/docs/enabled-features.md)
- [Profiling](https://github.com/github/memex/blob/main/docs/profiling.md)
- [Accessibility](https://github.com/github/memex/blob/main/docs/accessibility.md)

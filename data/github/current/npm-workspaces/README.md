# NPM Workspaces

Within the monolith, we have many teams/services that need npm dependencies. With a single `package.json`, it is difficult to track _ownership_ of these dependencies. To make ownership easier, we now track dependencies within separate [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces), with each workspace owned by one or more services.

👉 **For more information, see <https://thehub.github.com/engineering/dev-practicals/frontend/npm-dependencies-workspaces/>.**

## Installing/updating a dependency

To install or update a dependency, run the following command

```sh
bin/npm i <package-name>@latest -w npm-workspaces/<service-name>
```

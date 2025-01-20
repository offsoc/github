## Bumping Primer packages

### Uninstall existing dependency

```sh
bin/npm uninstall @primer/css -w ./npm-workspaces/primer/
```

### Check that uninstall was successful

```sh
bin/npm ls @primer/css
```

Expected:

```sh
  github@ /workspaces/github
  └── (empty)
```

### Install for Primer workspace

```sh
bin/npm i @primer/css@20.4.0 -w ./npm-workspaces/primer/
```

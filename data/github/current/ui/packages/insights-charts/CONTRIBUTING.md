# Contributing

## Setup

Install dependencies

```
npm install
```

Verify that the tests are passing

```
npm test
```

## Local Development

You can start a local development server for local testing and development.

```
npm run dev
```

This will start the sandbox dev server at http://localhost:9091, which is doing the following:

- Watching for changes in the local file system
- Rebuilding `dist` when changes occur
- Serving `dist`
- Serving `sandbox/index.html` which makes use of that `dist` buil

# unicorn-api

These Kubernetes resources describe a `unicorn` service closely resembling our current `github-api` nodes. Each Pod runs several containers: an `nginx` container to terminate HTTP connections and a `unicorn` container connected to the `nginx` container over a Unix socket.

You can also find in this directory the files related to unicorn-api perfomance lab, part of the [initiative](https://github.com/github/performance-engineering/issues/5) driven by performance-engineering team to funnel our traffic into particular instances where we can analyze performance.

## Reference

* https://janky.githubapp.com/github-build-docker-image

# Unicorn

These Kubernetes resources describe a `unicorn` service closely resembling our current `github-fe` nodes. Each Pod runs several containers: an `nginx` container to terminate HTTP connections and a `unicorn` container connected to the `nginx` container over a Unix socket.

## Reference

* https://janky.githubapp.com/github-build-docker-image

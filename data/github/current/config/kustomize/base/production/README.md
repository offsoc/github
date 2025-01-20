# Production Kubernetes Resources

The YAML in this directory represents the configuration necessary to run portions of the GitHub application on one of our Kubernetes clusters.

### Making changes

* Refer to [resources listed below](#resources) to help guide your change.
* Open a PR with your changes, CC-ing @github/delivery for review.
* `.deploy github/<branch>` like you're used to, working through canary first <sup>*1*</sup>

*1*: This deploy uses Heaven's new [kubernetes deploy strategy](https://github.com/github/heaven/blob/master/docs/strategies/kubernetes.md), which does a lot of things differently than Capistrano.

#### Resources

* GitHub-curated [Kubernetes resource overview documentation](https://github.com/github/kube/tree/master/docs/kubernetes/resources)
* A [recording of our recent Kubernetes training](https://githubber.tv/github/kubernetes-training)
* Thorough [upstream documentation](https://kubernetes.io/docs/)
* Detailed [Kubernetes resource reference documentation](https://kubernetes.io/docs/reference/)
* The kind Hubbers in `#delivery` or [@github/delivery](https://github.com/orgs/github/teams/delivery)

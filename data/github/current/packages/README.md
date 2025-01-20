# `/packages` 📦

This directory contains logical groupings of rails code that we've migrated to use [Packwerk](https://github.com/Shopify/packwerk/blob/main/USAGE.md#what-problem-does-packwerk-solve). 

Packwerk is a gem that allows us to gradually extract logical groupings of code into “packages” with closely guarded public interfaces.

### Further Information

- For a deeper understading of Packwerk and its goals, see [Packwerk's USAGE doc](https://github.com/Shopify/packwerk/blob/main/USAGE.md#what-problem-does-packwerk-solve).
- For guidance on migrating monolith code into a Packwerk package, see the [How to partition doc](https://github.com/github/app-core/blob/3ee63bd9312567cfc265ed4f9ca172c5819cb586/app-partitioning/how.md).
- For context around the motivations for adopting Packwerk, see the [Monolith Application Partitioning documentation](https://github.com/github/app-core/blob/main/app-partitioning/index.md).

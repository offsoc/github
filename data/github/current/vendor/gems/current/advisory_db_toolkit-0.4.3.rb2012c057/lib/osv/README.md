# AdvisoryDBToolkit::OSV

The OSV module provides a way to transform Advisory data to OSV and back, using common interface objects, in as lossless of a way as possible. The primary interface for interacting with the library is the `AdvisoryDBToolkit::OSV::Transform` module which exposes two methods:

- `to_osv` accepts an `AdvisoryDBToolkit::OSV::Interfaces::Advisory` object and returns a Ruby hash that is suitable for rendering as an OSV JSON file.
- `from_osv` accepts a Ruby hash based on a OSV JSON file and returns an `AdvisoryDBToolkit::OSV::Interfaces::Advisory` interface object.

This folder contains VSchema files for Vitess.

These are not suitable for use in production, as they don't use fully qualified names for sequences.

APPLYING THEM DIRECTLY IN PRODUCTION WILL MOST LIKELY CAUSE DOWNTIME.

Apart from the sequence names, they should match production VSchema files pretty closely.

They are managed via our migration tooling in development, e.g. `bin/rake db:structure:dump` will dump the
latest VSchema for each keyspace, `bin/rake db:structure:load` will load these files and apply them to the
locally running Vitess setup.

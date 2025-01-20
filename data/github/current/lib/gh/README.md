## The GH Namespace
The `GH` namespace was created as a tacit acknowledgement of the fact that with advent of monolith decoupling and packages we see ourselves relying on Ruby namespaces far more than we have in the past. Namespaces can easily become verbose without value, so in a desire to minimize boilerplate verbosity we thought a new `GH` namespace was in order.

Simultaneously, we want to take the opportunity of a fresh start to make this namespace not eager loaded by default like the rest of `lib`. While `GH` itself will be loaded, only those nested constants with autoloads explicitly defined in `lib/gh.rb` will be autoloaded when referenced. If the constant you need is not autoloaded, you will need to `require` it explicitly to ensure it is loaded.

Not eager loading these files helps us manage application start time, dependencies, and even enables us to extract code from `lib` into external gems should the need arise. It also allows us to to safely store code in `lib` that might have previously been kept in an overly long and untested script or buried in the `test` tree somewhere. With eager loading enabled this would have been a non-starter.

As of this writing, the `GH` namespace is still eagerly loaded but the `GH::Dev` namespace is not. This is intended to change in the short to medium term. Apologies to the reader if this turns out to be an inaccurate statement.

# External dependencies

This `app/external` directory is a place for us to build interfaces for our
external dependencies.

Ideally, the things in this directory would live in another package, but every
team is busy and building a clean domain interface isn't always a priority.

By pushing this code to the edge of our package we can avoid tight coupling and
maybe transfer ownership when the time is right.

Note that this is deliberately _not_ in `app/public`. If another team wants to
use something in this directory then that is a good indication that it's time to
move it out of our package to a more natural home.

## features/grouping

This directory is meant to contain logic related to grouping in the application.
Currently, the hooks are primarily used for the board and roadmap views, but there should
ideally not be any view-specific behavior in this area.

For example, `useHorizontalGroupedBy` accesses data about the view, but is agnostic to the
layout type.

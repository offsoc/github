## HEAD

## v0.7.0 / 2020-09-02

* `client.services.list` - convert some deprecated parameters to use the ServiceFilterSelectionInput argument

## v0.6.1 / 2020-07-19

* Fix bug in `client.scorecards.batch_update_scores` where the scores were zeroed-out.

## v0.6.0 / 2020-07-17

* Add `ServiceLinkDetail` fragment customization for `client.services.links`
* Add `client.scorecards.batch_update_scores`
* Add Service Filter methods:
    - `client.users.service_filters`
    - `client.users.delete_service_filter`
    - `client.users.create_service_filter`

## v0.5.0 / 2020-05-27

* Add `playbook_url` argument to `client.slos.update`
* Add Scorecard Find query (#1547)
    - `client.scorecards.find`
* Use `pageInfo` in service search query instead of `totalCount` (#1717)

## v0.4.0 / 2020-04-13

* Add Owner mutations to client (#1480)
    - `client.owners.list`
    - `client.owners.update`
* Add Service Link mutations to client (#1460)
    - `client.services.delete_link`
    - `client.services.update_link`

## v0.3.0 / 2020-04-03

* Add Service Search to client #1444
    - `client.services.search`
* Add supportLevel list/update/remove APIs to client (#1280)
    - `client.services.support_level`
    - `client.services.update_support_level`
    - `client.services.remove_support_level`
* Add updateService / deleteService to client (#1354)
    - `client.services.update_service`
    - `client.services.delete_service`
* Add SLO & SLO Summary APIs (#1385)
    - `client.slos.list`
    - `client.slos.update`
    - `client.slos.delete`
    - `client.slos.update_slo_summary`
    - `client.slos.delete_slo_summary`

## v0.2.0

* Add Groups-related methods:
    - `client.groups.list`
    - `client.groups.find`
    - `client.groups.delete`
    - `client.groups.update`

## v0.1.0

* Initial import.
- Services methods:
    - `client.services.list`
    - `client.services.find`
    - `client.services.dependencies`
    - `client.services.links`
    - `client.services.add_service_dependency`
    - `client.services.remove_service_dependency`
- TaskLocks methods:
    - `client.task_locks.acquire`
- Scorecards methods:
    - `client.scorecards.summaries`
    - `client.scorecards.update_score`

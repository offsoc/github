# ServiceCatalog::Client

A Ruby client for GitHub's Service Catalog.

## Installation

Add this to your application's Gemfile:

```ruby
source "https://octofactory.githubapp.com/artifactory/api/gems/cat-gems-releases-local"

gem "service-catalog-client"
```

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install service-catalog-client

## Usage

All use of the client is via the `ServiceCatalog::Client` instance:

```ruby
require "service-catalog-client"

# Create a client with your API token.
client = ServiceCatalog::Client.new(
    endpoint: "https://catalog.githubapp.com/graphql",
    token: ENV["SERVICE_CATALOG_TOKEN"]
)

# List services which have a maintainer.
# Documentation for this query can be found at
# https://catalog.githubapp.com/docs/ServiceCatalog/Client/ServicesQueryBinder.html#list-instance_method
response = client.services.list(has_maintainer: true, ...)
response.data.services.each do |service|
  puts "Fetched #{service.name}"
end
```

## Instrumentation

Using `ActiveSupport::Notifications`, we instrument queries as well as first-party loaders like `#services`. Each instrumentation key is specified in the query module, so if you want to instrument listing of services, you'd subscribe like this:

```ruby
ActiveSupport::Notifications.subscribe(ServiceCatalog::Client::Services::ListServicesQuery::INSTRUMENTATION_KEY) do |name, start, finish, id, payload|
    # Do something with the data. Payload differs per event.
end
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake test` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

You can start developing and testing with [your personal API token](https://github.com/github/cat/blob/HEAD/docs/api.md#how-to-get-an-api-token). When you'd like a long-lived bot token for your service, please [open an issue requesting one](https://github.com/github/cat/issues/new).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/github/cat. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](http://contributor-covenant.org) code of conduct.

## License

The gem is not open source at this time. All rights reserved, copyright GitHub, Inc. 2020.

## Code of Conduct

Everyone interacting in the ServiceCatalog::Client project's codebases, issue trackers, chat rooms and mailing lists is expected to follow the [code of conduct](https://github.com/github/cat/blob/HEAD/service-catalog-client/CODE_OF_CONDUCT.md).

# Octolytics

API wrapper and more for Octolytics. 

Important Note: 
- This is a legacy system that still powers some internal events, but has been largely superceded by [Hydro](https://github.com/github/hydro).
- If you are instrumenting a new event, please use Hydro instead. 
- If you are performing maintenance on an existing Octolytics event, note that this tool is now deprecated and it is strongly recommended to plan on migrating to supported eventing in the future. 

# Octolytics docs (for posterity)

## Installation

Because octolytics is an internal gem it is not released on rubygems. Instead, do this:

1. Download [latest released gem](https://github.com/github/octolytics/releases) to `vendor/cache`
2. Add to Gemfile `gem "octolytics"`
3. bundle or bootstrap or whatever for your project
4. :moneybag: :moneybag: :moneybag:

## Usage

### Collecting Data

The default setup of a client requires only the app you would like to record events for.

The client will automatically send events to the collector related to whatever environment your app is in using the following environment variables: `RAILS_ENV`, `RACK_ENV`, `APP_ENV`.

```
"development" - http://collector.dev
"test"        - http://collector.dev
"staging"     - https://collector-staging.githubapp.com
"production"  - https://collector.githubapp.com
```

This is the default setup. "github" corresponds to the app_id in https://analytics-app.service.private-us-east-1.github.net (requires VPN). A secret [generated on analytics-app.service.private-us-east-1.github.net](https://analytics-app.service.private-us-east-1.github.net) is required both for recording and retrieving data.

```ruby
client = Octolytics::Client.new("github", secret: "abc123")
```

You can force the environment as well (development, staging, and production supported):

```ruby
client = Octolytics::Client.new("github",
  environment: "staging",
  secret:      "abc123",
)
```

Once you have a client, you can start recording events:

```ruby
# record an event with type `tweet`
client.record "tweet"

# record an event with dimensions (string => string)
client.record "tweet", {tweet_id: "1234", source: "..."}

# record an event with measures (string => integer)
client.record "tweet", {...}, {retweets: 31}

# record an event with other context (string => any JSON type)
client.record "tweet", {...}, {...}, {plugins: ["a", "b", "c"]}

# change the timestamp for an event
client.record "tweet", {...}, {...}, {...}, tweet.created_at
```

`#record` returns an [Octolytics::Response](https://github.com/github/octolytics/blob/master/lib/octolytics/response.rb) instance.

```ruby
response = client.record("tweet")
p response.body   # => "{\"message\":\"Got it\"}"
p response.data   # => {"message"=>"Got it"}
```

Multiple events can be recorded at one time, reducing load on the collector and allowing for transactional semantics (i.e., either all or none of the messages are sent):

```ruby
client.record [
  {event_type: "tweet", dimensions: {tweet_id: "1234"}, measures: {retweets: 31}},
  {event_type: "tweet", dimensions: {tweet_id: "1235"}, measures: {retweets: 20}},
]
```

### Reporting Data

Reporting data requires a preshared `secret` for authorization. The secret is
automatically generated in [Octolytics](http://analytics-app.service.private-us-east-1.github.net) when a
new app is created (you can find it on the setup page for an app).

#### Counts

```ruby
client   = Octolytics::Client.new("github", secret: "abc123")
response = client.counts(
  event_type:       'page_view',
  dimension:        'repository_id',
  dimension_value:  1,
  bucket:           'hourly',
)

p response.data["counts"] # => [{"total" => 40, "unique" => 25, "bucket" => 1379480400}, ...]
```

#### Referrers

```ruby
client   = Octolytics::Client.new("github", secret: "abc123")
response = client.referrers(
  event_type:       'page_view',
  dimension:        'repository_id',
  dimension_value:  1,
)

p response.data["referrers"] # => [{"referrer" => "Google", "total" => 512, "unique": 169}, ...]
```

#### Referrer Paths

```ruby
client   = Octolytics::Client.new("github", secret: "abc123")
response = client.referrer_paths(
  event_type:       'page_view',
  dimension:        'repository_id',
  dimension_value:  1,
  referrer:         'Google',
)

p response.data["paths"] # => [{"path" => "/", "total" => 264, "unique" => 103}, ...]
```

#### Content

```ruby
client   = Octolytics::Client.new("github", secret: "abc123")
response = client.content(
  event_type:       'page_view',
  dimension:        'repository_id',
  dimension_value:  1,
)

p response.data["content"] # => [{"path" => "/mojombo/grit", "total" => 484, "unique" => 354, "title" => "mojombo/grit"}, ...]
```

#### Raw event data by date range, streamed from permanent storage

```ruby
client = Octolytics::Client.new("github", secret: "abc123")
options = {
  event_type: "page_view",
  from: "-1w",
  decompress: true
}

response = client.raw_events(options) do |tsv_data_chunk|
 # tsv data streamed in chunks from the server, which you
 # should buffer or write to disk and do what you need with
 p tsv_data_chunk
end

# =>
# 6cfc664c-305b-11e3-8fb4-a5b3a7ec0bcd	github	page_view	1381265497	{"context":{},"dimensions": ...etc...
```

### Metrics API

In addition to the collector and reporter APIs, this gem also has a client for the [metrics-api](https://github.com/github/metrics-api).

```ruby
# defaults to development environment
require "octolytics/metrics"
metrics = Octolytics::Metrics.new({
  secret: "...",
})

# you can also talk to staging or production
staging = Octolytics::Metrics.new({
  secret: "...",
  environment: "staging",
})
production = Octolytics::Metrics.new({
  secret: "...",
  environment: "production",
})

```

You can obtain the secret from the metrics-api config (`METRICSAPI_SHARED_SECRET`).

```
ssh remote.github.net
gh-config metrics-api metrics
```

### Errors

Responses that come back unsuccessfully (e.g., non-200 status code or timeout)
will raise exceptions.

```ruby
begin
  client   = Octolytics::Client.new("github", secret: "abc123")
  response = client.referrer_paths(
    event_type:       'page_view',
    dimension:        'repository_id',
    dimension_value:  1,
    referrer:         'Google',
  )
rescue Octolytics::Error
  # An error occurred :(
  #
  # Possible subtypes: Octolytics::ClientError, Octolytics::ServerError, Octolytics::Timeout
end
```

## Instrumentation

Octolytics comes with automatic instrumentation to statsd and you can create your own subscribers to send instrumentation anywhere you want. To use the statsd subscriber, simply [require the file and configure the client](https://github.com/github/octolytics/tree/master/examples/instrumentation.rb).

```ruby
require "statsd"
require "octolytics"
require "octolytics/instrumentation/statsd"

# Setup the statsd client to receive the timing calls.
Octolytics::Instrumentation::StatsdSubscriber.client = Statsd.new

# Create new client instance and setup ActiveSupport::Notifications as the
# instrumenter that should generate the instrumentation events.
client = Octolytics::Client.new("github", {
  secret: "abc123",
  instrumenter: ActiveSupport::Notifications,
})

# 1. Call method that is instrumented.
# 2. Method generates `collector.octolytics` event.
# 3. StatsdSubscriber updates `octolytics.collector.record` timer in statsd.
client.record(...)
```

## Event Machine

Event Machine is supported through the use of a different adapter. See the [event machine example](https://github.com/github/octolytics/blob/master/examples/event_machine.rb) for more.

## Releasing

1. Increment version based on changes (ie: http://semver.org/)
2. gem build octolytics.gemspec
3. Create [release](https://github.com/github/octolytics/releases), including gem binary from previous step.

## Maintainers

The @github/data-pipelines team.

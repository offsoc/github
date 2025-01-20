# Aqueduct::Client

## Installation

The `aqueduct-client` gem is currently private (i.e. not available on rubygems.org) but is published to GitHub package.

Once you've authenticated to the Packages gem source, you can install the gem by adding this to your Gemfile:

```rb
source "https://rubygems.pkg.github.com/github" do
  gem "aqueduct-client"
end
```

Alternatively, you can copy a gem vendoring script like [this one](https://github.com/github/github/blob/master/script/vendor-gem) into your project's script directory. Then, add `gem "aqueduct-client"` to your `Gemfile` and run `script/vendor-gem`.

```
$ echo 'gem "aqueduct-client"' >> Gemfile
$ script/vendor-gem -r main -n aqueduct-client https://github.com/github/aqueduct-client-ruby
```

## Usage

Send and receive aqueduct jobs with `Aqueduct::Client`.

```Ruby
require "aqueduct"

Aqueduct.configure do |config|
  # Required: Configure your aqueduct app name.
  config.app = "your-app-production"
end

client = Aqueduct::Client.new
client.send_job(queue: "test-queue", payload: "abc")
client.receive_job(queues: ["test-queue"], timeout: 10)
# => {app: "your-app-production", queue: "test-queue", payload: "abc"}
```

To process jobs with a worker process, configure a worker and run `rake aqueduct:work`.

```Ruby
require "aqueduct"
require "aqueduct/worker"

Aqueduct.configure do |config|
  # Required: Configure your aqueduct app name.
  config.app = "your-app-production"
end

Aqueduct::Worker.configure do |config|
  config.handler = ->(job, result) {
    begin
      # A handler call that doesn't throw an exception will implicitly ACK the job when complete.
      puts "Processing job from #{job.queue} with payload #{job.payload}"
    rescue
      # ACK the job as failed if it should not be redelivered. If a job is not ACKed, aqueduct will
      # assume it has been dropped and redeliver it.
      result.failed!
    end
  }
end
```

```
# This example expects a `rake environment` task that loads your app and the aqueduct config.
QUEUES=test-queue,another-queue rake environment aqueduct:work
```

## Development

Install dependencies with `script/bootstrap`. Run tests with `bundle exec rake spec`.

# frozen_string_literal: true

require_relative "lib/github/telemetry/version"
Gem::Specification.new do |spec|
  spec.name          = "github-telemetry"
  spec.version       = GitHub::Telemetry::VERSION
  spec.authors       = ["GitHub Observability Team"]
  spec.email         = ["observability@github.com"]

  spec.summary       = "Centralized, default configurations for OpenTelemetry w/ Ruby at GitHub"
  spec.homepage      = "https://github.com/github/github-telemetry-ruby"
  spec.required_ruby_version = Gem::Requirement.new(">= 3.0.0")

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage
  spec.metadata["changelog_uri"] = "#{spec.homepage}/releases"
  spec.metadata["bug_tracker_uri"] = "#{spec.homepage}/issues"
  spec.metadata["documentation_uri"] = "#{spec.homepage}/blob/main/README.md"
  spec.metadata["allowed_push_host"] = ENV.fetch("PUSH_HOST", "https://octofactory.githubapp.com/artifactory/api/gems/github-telemetry-ruby-gems-releases-local")
  spec.metadata["github_repo"] = "git@github.com:github/github-telemetry-ruby.git"

  spec.files = ::Dir.glob("lib/**/*.rb") +
               ::Dir.glob("*.md") +
               [".yardopts"] +
               ["github-telemetry.gemspec"]
  spec.require_paths = ["lib"]

  spec.license = "MIT"

  spec.add_dependency "opentelemetry-sdk", "~> 1.3", ">= 1.3.0"
  spec.add_dependency "opentelemetry-registry", "~> 0.3", ">= 0.3.0"
  spec.add_dependency "opentelemetry-exporter-otlp", "~> 0.26", ">= 0.26.1"
  spec.add_dependency "opentelemetry-instrumentation-rack", "~> 0.23", ">= 0.23.3"
  spec.add_dependency "opentelemetry-instrumentation-ethon", "~> 0.21", ">= 0.21.6"
  spec.add_dependency "opentelemetry-instrumentation-excon", "~> 0.22", ">= 0.21.2"
  spec.add_dependency "opentelemetry-instrumentation-faraday", "~> 0.24", ">= 0.24.0"
  spec.add_dependency "opentelemetry-instrumentation-graphql", "~> 0.28", ">= 0.28.4"
  spec.add_dependency "opentelemetry-instrumentation-net_http", "~> 0.22", ">= 0.22.2"
  spec.add_dependency "opentelemetry-instrumentation-rails", "~> 0.27", ">= 0.27.1"
  spec.add_dependency "opentelemetry-instrumentation-ruby_kafka", "~> 0.20", ">= 0.20.1"
  spec.add_dependency "opentelemetry-instrumentation-trilogy", "~> 0.56", ">= 0.56.2"
  spec.add_dependency "semantic_logger", "4.15"

  spec.add_development_dependency "appraisal", "~> 2.4"
  spec.add_development_dependency "debug", "~> 1.6"
  spec.add_development_dependency "climate_control", "~> 1.0"
  spec.add_development_dependency "dogstatsd-ruby", "~> 5.0"
  spec.add_development_dependency "faraday", ">= 0.17"
  spec.add_development_dependency "rake", "~> 13.0"
  spec.add_development_dependency "rails_semantic_logger", "4.16"
  spec.add_development_dependency "redcarpet", "~> 3.5"
  spec.add_development_dependency "rspec", "~> 3.0"
  spec.add_development_dependency "rspec-collection_matchers", "~> 1.2"
  spec.add_development_dependency "rspec-rails", "~> 6"
  spec.add_development_dependency "rubocop-github", "~> 0.20"
  spec.add_development_dependency "rubocop-rspec", "~> 2.22"
  spec.add_development_dependency "statsd-instrument", "~> 3.5"
  spec.add_development_dependency "timecop", "~> 0.9"
  spec.add_development_dependency "yard", "~> 0.9"
  spec.add_development_dependency "webmock", "~> 3.0"
end

# -*- encoding: utf-8 -*-
# stub: github-telemetry 0.49.8 ruby lib

Gem::Specification.new do |s|
  s.name = "github-telemetry".freeze
  s.version = "0.49.8".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://octofactory.githubapp.com/artifactory/api/gems/github-telemetry-ruby-gems-releases-local", "bug_tracker_uri" => "https://github.com/github/github-telemetry-ruby/issues", "changelog_uri" => "https://github.com/github/github-telemetry-ruby/releases", "documentation_uri" => "https://github.com/github/github-telemetry-ruby/blob/main/README.md", "github_repo" => "git@github.com:github/github-telemetry-ruby.git", "homepage_uri" => "https://github.com/github/github-telemetry-ruby", "source_code_uri" => "https://github.com/github/github-telemetry-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub Observability Team".freeze]
  s.date = "2024-07-31"
  s.email = ["observability@github.com".freeze]
  s.homepage = "https://github.com/github/github-telemetry-ruby".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Centralized, default configurations for OpenTelemetry w/ Ruby at GitHub".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<opentelemetry-sdk>.freeze, ["~> 1.3".freeze, ">= 1.3.0".freeze])
  s.add_runtime_dependency(%q<opentelemetry-registry>.freeze, ["~> 0.3".freeze, ">= 0.3.0".freeze])
  s.add_runtime_dependency(%q<opentelemetry-exporter-otlp>.freeze, ["~> 0.26".freeze, ">= 0.26.1".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-rack>.freeze, ["~> 0.23".freeze, ">= 0.23.3".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-ethon>.freeze, ["~> 0.21".freeze, ">= 0.21.6".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-excon>.freeze, ["~> 0.22".freeze, ">= 0.21.2".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-faraday>.freeze, ["~> 0.24".freeze, ">= 0.24.0".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-graphql>.freeze, ["~> 0.28".freeze, ">= 0.28.4".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-net_http>.freeze, ["~> 0.22".freeze, ">= 0.22.2".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-rails>.freeze, ["~> 0.27".freeze, ">= 0.27.1".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-ruby_kafka>.freeze, ["~> 0.20".freeze, ">= 0.20.1".freeze])
  s.add_runtime_dependency(%q<opentelemetry-instrumentation-trilogy>.freeze, ["~> 0.56".freeze, ">= 0.56.2".freeze])
  s.add_runtime_dependency(%q<semantic_logger>.freeze, ["= 4.15".freeze])
  s.add_development_dependency(%q<appraisal>.freeze, ["~> 2.4".freeze])
  s.add_development_dependency(%q<debug>.freeze, ["~> 1.6".freeze])
  s.add_development_dependency(%q<climate_control>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<dogstatsd-ruby>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<faraday>.freeze, [">= 0.17".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rails_semantic_logger>.freeze, ["= 4.16".freeze])
  s.add_development_dependency(%q<redcarpet>.freeze, ["~> 3.5".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<rspec-collection_matchers>.freeze, ["~> 1.2".freeze])
  s.add_development_dependency(%q<rspec-rails>.freeze, ["~> 6".freeze])
  s.add_development_dependency(%q<rubocop-github>.freeze, ["~> 0.20".freeze])
  s.add_development_dependency(%q<rubocop-rspec>.freeze, ["~> 2.22".freeze])
  s.add_development_dependency(%q<statsd-instrument>.freeze, ["~> 3.5".freeze])
  s.add_development_dependency(%q<timecop>.freeze, ["~> 0.9".freeze])
  s.add_development_dependency(%q<yard>.freeze, ["~> 0.9".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.0".freeze])
end

# -*- encoding: utf-8 -*-
# stub: dogapi 1.45.0 ruby lib

Gem::Specification.new do |s|
  s.name = "dogapi".freeze
  s.version = "1.45.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/DataDog/dogapi-rb/issues", "changelog_uri" => "https://github.com/DataDog/dogapi-rb/blob/master/CHANGELOG.md", "documentation_uri" => "https://docs.datadoghq.com/api/", "source_code_uri" => "https://github.com/DataDog/dogapi-rb" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Datadog, Inc.".freeze]
  s.date = "2021-01-27"
  s.description = "Ruby bindings for Datadog's API".freeze
  s.email = ["packages@datadoghq.com".freeze]
  s.extra_rdoc_files = ["README.rdoc".freeze]
  s.files = ["README.rdoc".freeze]
  s.homepage = "http://datadoghq.com/".freeze
  s.licenses = ["BSD".freeze]
  s.rdoc_options = ["--title".freeze, "DogAPI -- Datadog Client".freeze, "--main".freeze, "README.rdoc".freeze, "--line-numbers".freeze, "--inline-source".freeze]
  s.rubygems_version = "3.0.6".freeze
  s.summary = "Ruby bindings for Datadog's API".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<multi_json>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 1.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10".freeze])
  s.add_development_dependency(%q<rdoc>.freeze, [">= 0".freeze])
end

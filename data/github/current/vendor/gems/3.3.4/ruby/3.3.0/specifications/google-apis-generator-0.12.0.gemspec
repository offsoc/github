# -*- encoding: utf-8 -*-
# stub: google-apis-generator 0.12.0 ruby lib

Gem::Specification.new do |s|
  s.name = "google-apis-generator".freeze
  s.version = "0.12.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/googleapis/google-api-ruby-client/issues", "changelog_uri" => "https://github.com/googleapis/google-api-ruby-client/tree/main/google-apis-generator/CHANGELOG.md", "documentation_uri" => "https://googleapis.dev/ruby/google-apis-generator/v0.12.0", "source_code_uri" => "https://github.com/googleapis/google-api-ruby-client/tree/main/google-apis-generator" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Google LLC".freeze]
  s.date = "2023-02-15"
  s.email = "googleapis-packages@google.com".freeze
  s.executables = ["generate-api".freeze]
  s.files = ["bin/generate-api".freeze]
  s.homepage = "https://github.com/google/google-api-ruby-client".freeze
  s.licenses = ["Apache-2.0".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.5".freeze)
  s.rubygems_version = "3.4.2".freeze
  s.summary = "Code generator for legacy Google REST clients".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 5.0".freeze])
  s.add_runtime_dependency(%q<gems>.freeze, ["~> 1.2".freeze])
  s.add_runtime_dependency(%q<google-apis-core>.freeze, [">= 0.11.0".freeze, "< 2.a".freeze])
  s.add_runtime_dependency(%q<google-apis-discovery_v1>.freeze, ["~> 0.5".freeze])
  s.add_runtime_dependency(%q<thor>.freeze, [">= 0.20".freeze, "< 2.a".freeze])
end

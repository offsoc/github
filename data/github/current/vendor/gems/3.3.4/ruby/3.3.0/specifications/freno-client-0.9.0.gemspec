# -*- encoding: utf-8 -*-
# stub: freno-client 0.9.0 ruby lib

Gem::Specification.new do |s|
  s.name = "freno-client".freeze
  s.version = "0.9.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org", "bug_tracker_uri" => "https://github.com/github/freno-client/issues", "homepage_uri" => "https://github.com/github/freno-client", "rubygems_mfa_required" => "true", "source_code_uri" => "https://github.com/github/freno-client" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub".freeze]
  s.date = "2024-04-18"
  s.description = "freno-client is a Ruby library that interacts with Freno using HTTP. Freno is a throttling service and its source code is available at https://github.com/github/freno ".freeze
  s.email = "opensource+freno-client@github.com".freeze
  s.extra_rdoc_files = ["README.md".freeze]
  s.files = ["README.md".freeze]
  s.homepage = "https://github.com/github/freno-client".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0".freeze)
  s.rubygems_version = "3.4.19".freeze
  s.summary = "A library for interacting with Freno, the throttler service".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<faraday>.freeze, ["< 3".freeze])
end

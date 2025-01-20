# -*- encoding: utf-8 -*-
# stub: kusto-data 0.0.1.r613977e ruby lib

Gem::Specification.new do |s|
  s.name = "kusto-data".freeze
  s.version = "0.0.1.r613977e".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "github_repo" => "ssh://github.com/github/kusto-client-ruby" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["github/api-platform".freeze]
  s.date = "2024-07-11"
  s.description = "kusto-data is a library for querying data out of Kusto databases.".freeze
  s.homepage = "http://github.com/github/kusto-client-ruby".freeze
  s.licenses = ["Nonstandard".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Client for querying Kusto databases".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, ["~> 0.5".freeze])
end

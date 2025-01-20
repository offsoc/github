# -*- encoding: utf-8 -*-
# stub: spamurai-dev-kit 3.0.1 ruby lib

Gem::Specification.new do |s|
  s.name = "spamurai-dev-kit".freeze
  s.version = "3.0.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://octofactory.githubapp.com/artifactory/api/gems/spamurai-dev-kit-gems-releases-local" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["@github/platform-health-engineers".freeze]
  s.date = "2020-07-24"
  s.email = "hktouw@github.com".freeze
  s.homepage = "https://github.com/github/spamurai-dev-kit".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.1.2".freeze
  s.summary = "library for using the Platform Health services".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<dogstatsd-ruby>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<msgpack>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<octicons>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<byebug>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mocha>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pry>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end

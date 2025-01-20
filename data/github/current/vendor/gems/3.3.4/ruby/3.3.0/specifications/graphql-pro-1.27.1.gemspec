# -*- encoding: utf-8 -*-
# stub: graphql-pro 1.27.1 ruby lib

Gem::Specification.new do |s|
  s.name = "graphql-pro".freeze
  s.version = "1.27.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://gems.graphql.pro", "bug_tracker_uri" => "https://github.com/rmosolgo/graphql-ruby/issues", "changelog_uri" => "https://github.com/rmosolgo/graphql-ruby/blob/master/CHANGELOG-pro.md", "homepage_uri" => "https://graphql.pro" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Robert Mosolgo".freeze]
  s.date = "2024-04-18"
  s.email = "rmosolgo@graphql.pro".freeze
  s.homepage = "https://graphql.pro".freeze
  s.licenses = ["Nonstandard".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.1.0".freeze)
  s.rubygems_version = "3.3.7".freeze
  s.summary = "Toolkit for building on the GraphQL runtime".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<graphql>.freeze, [">= 1.7.5".freeze])
  s.add_development_dependency(%q<ably-rest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<cancancan>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<composite_primary_keys>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<ed25519>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<graphql-batch>.freeze, ["~> 0.3".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.10.1".freeze])
  s.add_development_dependency(%q<minitest-focus>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<minitest-reporters>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rails>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<redis>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<redis-namespace>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<redis-client>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 0.81.0".freeze])
  s.add_development_dependency(%q<mongoid>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<net-ssh>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<net-scp>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pundit>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pry>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pusher>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sequel>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sinatra>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sinatra-contrib>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sqlite3>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<timecop>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pg>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<bcrypt_pbkdf>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mysql2>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, [">= 0".freeze])
end

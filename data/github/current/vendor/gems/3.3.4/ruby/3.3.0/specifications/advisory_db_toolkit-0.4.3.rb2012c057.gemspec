# -*- encoding: utf-8 -*-
# stub: advisory_db_toolkit 0.4.3.rb2012c057 ruby lib

Gem::Specification.new do |s|
  s.name = "advisory_db_toolkit".freeze
  s.version = "0.4.3.rb2012c057".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "TODO: Set to your gem server 'https://example.com'", "homepage_uri" => "https://github.com/github/advisory-db/tree/main/packages/advisory_db_toolkit", "rubygems_mfa_required" => "true", "source_code_uri" => "https://github.com/github/advisory-db/tree/main/packages/advisory_db_toolkit" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Advisory Database".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-07-23"
  s.description = "See summary.".freeze
  s.homepage = "https://github.com/github/advisory-db/tree/main/packages/advisory_db_toolkit".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.1.0".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "Gem consolidating common Advisory DB tools, including OSV translation logic for GHSA -> OSV and vice versa.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<json_schema>.freeze, [">= 0.20.4".freeze, "< 0.22".freeze])
  s.add_runtime_dependency(%q<semantic>.freeze, ["~> 1.6".freeze])
end

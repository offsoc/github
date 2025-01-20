# -*- encoding: utf-8 -*-
# stub: progeny 0.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "progeny".freeze
  s.version = "0.2.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "changelog_uri" => "https://github.com/luanzeba/progeny/blob/main/CHANGELOG.md", "homepage_uri" => "https://github.com/luanzeba/progeny", "source_code_uri" => "https://github.com/luanzeba/progeny" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Luan Vieira".freeze]
  s.date = "2024-05-17"
  s.description = "Spawn child processes without managing IO streams, zombie processes and other details.".freeze
  s.email = ["luanv@me.com".freeze]
  s.homepage = "https://github.com/luanzeba/progeny".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.7.0".freeze)
  s.rubygems_version = "3.0.3.1".freeze
  s.summary = "A process spawn wrapper with a nice interface and extra options.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<minitest>.freeze, [">= 4".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
end

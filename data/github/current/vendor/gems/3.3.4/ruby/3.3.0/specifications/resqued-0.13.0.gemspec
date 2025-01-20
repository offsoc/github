# -*- encoding: utf-8 -*-
# stub: resqued 0.13.0 ruby lib

Gem::Specification.new do |s|
  s.name = "resqued".freeze
  s.version = "0.13.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Matt Burke".freeze]
  s.bindir = "exe".freeze
  s.date = "2023-12-01"
  s.description = "Daemon of resque workers".freeze
  s.email = "spraints@gmail.com".freeze
  s.executables = ["resqued".freeze]
  s.files = ["exe/resqued".freeze]
  s.homepage = "https://github.com/spraints/resqued".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.1.6".freeze
  s.summary = "Daemon of resque workers".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<kgio>.freeze, ["~> 2.6".freeze])
  s.add_runtime_dependency(%q<mono_logger>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["= 13.0.1".freeze])
  s.add_development_dependency(%q<resque>.freeze, [">= 1.9.1".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["= 3.9.0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["= 0.79.0".freeze])
end

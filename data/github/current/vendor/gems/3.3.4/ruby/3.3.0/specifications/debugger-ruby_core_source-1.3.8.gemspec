# -*- encoding: utf-8 -*-
# stub: debugger-ruby_core_source 1.3.8 ruby lib

Gem::Specification.new do |s|
  s.name = "debugger-ruby_core_source".freeze
  s.version = "1.3.8".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 1.3.6".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Mark Moseley".freeze, "Gabriel Horner".freeze]
  s.date = "2015-01-23"
  s.description = "Provide Ruby core source files for C extensions that need them.".freeze
  s.email = "gabriel.horner@gmail.com".freeze
  s.extra_rdoc_files = ["README.md".freeze]
  s.files = ["README.md".freeze]
  s.homepage = "http://github.com/cldwalker/debugger-ruby_core_source".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.2.2".freeze
  s.summary = "Provide Ruby core source files".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<archive-tar-minitar>.freeze, [">= 0.5.2".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 0.9.2".freeze])
end

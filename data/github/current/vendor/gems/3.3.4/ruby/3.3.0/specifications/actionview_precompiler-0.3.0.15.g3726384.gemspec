# -*- encoding: utf-8 -*-
# stub: actionview_precompiler 0.3.0.15.g3726384 ruby lib

Gem::Specification.new do |s|
  s.name = "actionview_precompiler".freeze
  s.version = "0.3.0.15.g3726384".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["John Hawthorn".freeze]
  s.date = "2024-02-06"
  s.description = "Parses templates for render calls and uses them to precompile".freeze
  s.email = ["john@hawthorn.email".freeze]
  s.homepage = "https://github.com/jhawthorn/actionview_precompiler".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.6".freeze)
  s.rubygems_version = "3.5.3".freeze
  s.summary = "Precompiles ActionView templates".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<actionview>.freeze, [">= 6.0.a".freeze])
  s.add_development_dependency(%q<bundler>.freeze, ["~> 2.1".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 12.0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
end

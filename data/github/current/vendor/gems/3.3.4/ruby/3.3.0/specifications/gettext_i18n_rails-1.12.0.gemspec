# -*- encoding: utf-8 -*-
# stub: gettext_i18n_rails 1.12.0 ruby lib

Gem::Specification.new do |s|
  s.name = "gettext_i18n_rails".freeze
  s.version = "1.12.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Michael Grosser".freeze]
  s.date = "2023-06-21"
  s.email = "michael@grosser.it".freeze
  s.homepage = "http://github.com/grosser/gettext_i18n_rails".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.1.0".freeze)
  s.rubygems_version = "3.3.3".freeze
  s.summary = "Simple FastGettext Rails integration.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<fast_gettext>.freeze, [">= 0.9.0".freeze])
  s.add_development_dependency(%q<bump>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<gettext>.freeze, [">= 3.0.2".freeze])
  s.add_development_dependency(%q<haml>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<hamlit>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rails>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<ruby_parser>.freeze, [">= 3.7.1".freeze])
  s.add_development_dependency(%q<sexp_processor>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<slim>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sqlite3>.freeze, [">= 0".freeze])
end

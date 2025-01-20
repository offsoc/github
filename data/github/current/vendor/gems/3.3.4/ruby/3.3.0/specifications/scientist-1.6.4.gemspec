# -*- encoding: utf-8 -*-
# stub: scientist 1.6.4 ruby lib

Gem::Specification.new do |s|
  s.name = "scientist".freeze
  s.version = "1.6.4".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["GitHub Open Source".freeze, "John Barnette".freeze, "Rick Bradley".freeze, "Jesse Toth".freeze, "Nathan Witmer".freeze]
  s.date = "2023-04-05"
  s.description = "A Ruby library for carefully refactoring critical paths".freeze
  s.email = ["opensource+scientist@github.com".freeze, "jbarnette@github.com".freeze, "rick@rickbradley.com".freeze, "jesseplusplus@github.com".freeze, "zerowidth@github.com".freeze]
  s.homepage = "https://github.com/github/scientist".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.3".freeze)
  s.rubygems_version = "3.3.7".freeze
  s.summary = "Carefully test, measure, and track refactored code.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.8".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end

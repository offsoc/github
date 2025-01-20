# -*- encoding: utf-8 -*-
# stub: re2 2.9.0 ruby lib
# stub: ext/re2/extconf.rb

Gem::Specification.new do |s|
  s.name = "re2".freeze
  s.version = "2.9.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Paul Mucur".freeze, "Stan Hu".freeze]
  s.date = "2024-02-29"
  s.description = "Ruby bindings to RE2, \"a fast, safe, thread-friendly alternative to backtracking regular expression engines like those used in PCRE, Perl, and Python\".".freeze
  s.extensions = ["ext/re2/extconf.rb".freeze]
  s.files = ["ext/re2/extconf.rb".freeze]
  s.homepage = "https://github.com/mudge/re2".freeze
  s.licenses = ["BSD-3-Clause".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.6.0".freeze)
  s.rubygems_version = "3.4.19".freeze
  s.summary = "Ruby bindings to RE2.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake-compiler>.freeze, ["~> 1.2.5".freeze])
  s.add_development_dependency(%q<rake-compiler-dock>.freeze, ["~> 1.4.0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.2".freeze])
  s.add_runtime_dependency(%q<mini_portile2>.freeze, ["~> 2.8.5".freeze])
end

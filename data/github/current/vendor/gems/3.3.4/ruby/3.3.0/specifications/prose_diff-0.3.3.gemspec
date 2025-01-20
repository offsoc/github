# -*- encoding: utf-8 -*-
# stub: prose_diff 0.3.3 ruby lib

Gem::Specification.new do |s|
  s.name = "prose_diff".freeze
  s.version = "0.3.3".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Reg Braithwaite".freeze]
  s.date = "2022-01-28"
  s.description = "Calculate and render diffs of HTML trees.".freeze
  s.email = ["reg.braithwaite@github.com".freeze]
  s.homepage = "https://github.com/github/prose_diff".freeze
  s.rubygems_version = "3.2.5".freeze
  s.summary = "Make diffs look pretty.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<diff-lcs>.freeze, ["~> 1.4".freeze])
  s.add_runtime_dependency(%q<nokogiri>.freeze, ["~> 1.6".freeze])
  s.add_runtime_dependency(%q<ffi>.freeze, ["~> 1.9".freeze])
  s.add_runtime_dependency(%q<levenshtein-ffi>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<guard>.freeze, ["~> 1.8".freeze])
  s.add_development_dependency(%q<ruby-prof>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<guard-rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rb-fsevent>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<guard-sass>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sass>.freeze, [">= 0".freeze])
end

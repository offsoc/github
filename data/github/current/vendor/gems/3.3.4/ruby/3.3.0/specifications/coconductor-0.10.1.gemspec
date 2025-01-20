# -*- encoding: utf-8 -*-
# stub: coconductor 0.10.1 ruby lib

Gem::Specification.new do |s|
  s.name = "coconductor".freeze
  s.version = "0.10.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Ben Balter".freeze]
  s.date = "2021-03-02"
  s.email = ["ben.balter@github.com".freeze]
  s.executables = ["coconductor".freeze]
  s.files = ["bin/coconductor".freeze]
  s.homepage = "https://github.com/benbalter/coconductor".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.2.12".freeze
  s.summary = "work-in-progress code of conduct detector based off Licensee".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<licensee>.freeze, ["~> 9.9".freeze, ">= 9.9.4".freeze])
  s.add_runtime_dependency(%q<thor>.freeze, [">= 0.18".freeze, "< 2.0".freeze])
  s.add_runtime_dependency(%q<toml>.freeze, ["~> 0.2".freeze])
  s.add_development_dependency(%q<gem-release>.freeze, ["~> 2.0".freeze])
  s.add_development_dependency(%q<pry>.freeze, ["~> 0.10".freeze])
  s.add_development_dependency(%q<reverse_markdown>.freeze, ["~> 1.1".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 1.0".freeze])
  s.add_development_dependency(%q<rubocop-performance>.freeze, ["~> 1.5".freeze])
  s.add_development_dependency(%q<rubocop-rspec>.freeze, ["~> 2.0".freeze])
  s.add_development_dependency(%q<twitter-text>.freeze, ["< 2.0".freeze])
  s.add_development_dependency(%q<webmock>.freeze, ["~> 3.1".freeze])
  s.add_development_dependency(%q<wikicloth>.freeze, ["~> 0.8".freeze])
end

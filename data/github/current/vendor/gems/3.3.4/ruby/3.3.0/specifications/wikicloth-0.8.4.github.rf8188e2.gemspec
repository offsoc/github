# -*- encoding: utf-8 -*-
# stub: wikicloth 0.8.4.github.rf8188e2 ruby lib

Gem::Specification.new do |s|
  s.name = "wikicloth".freeze
  s.version = "0.8.4.github.rf8188e2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["David Ricciardi".freeze]
  s.date = "2024-07-15"
  s.description = "mediawiki parser".freeze
  s.email = "nricciar@gmail.com".freeze
  s.extra_rdoc_files = ["README".freeze, "MIT-LICENSE".freeze]
  s.files = ["MIT-LICENSE".freeze, "README".freeze]
  s.homepage = "https://github.com/github/wikicloth".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "An implementation of the mediawiki markup in ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<builder>.freeze, ["~> 3.2".freeze])
  s.add_runtime_dependency(%q<expression_parser>.freeze, ["~> 0.9.0".freeze])
  s.add_runtime_dependency(%q<rinku>.freeze, ["~> 2.0".freeze])
  s.add_runtime_dependency(%q<i18n>.freeze, ["~> 1.7".freeze])
  s.add_development_dependency(%q<test-unit>.freeze, ["~> 3.2.1".freeze])
  s.add_development_dependency(%q<activesupport>.freeze, ["~> 5.0.0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 11.2.2".freeze])
  s.add_development_dependency(%q<rdoc>.freeze, ["~> 4.2.2".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, ["= 0.12.0".freeze])
end

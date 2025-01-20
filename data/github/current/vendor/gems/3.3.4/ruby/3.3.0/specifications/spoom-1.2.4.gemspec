# -*- encoding: utf-8 -*-
# stub: spoom 1.2.4 ruby lib

Gem::Specification.new do |s|
  s.name = "spoom".freeze
  s.version = "1.2.4".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Alexandre Terrasa".freeze]
  s.bindir = "exe".freeze
  s.date = "2023-09-15"
  s.email = ["ruby@shopify.com".freeze]
  s.executables = ["spoom".freeze]
  s.files = ["exe/spoom".freeze]
  s.homepage = "https://github.com/Shopify/spoom".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.0.0".freeze)
  s.rubygems_version = "3.4.19".freeze
  s.summary = "Useful tools for Sorbet enthusiasts.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, [">= 2.2.10".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.0".freeze])
  s.add_development_dependency(%q<minitest-reporters>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0.1".freeze])
  s.add_runtime_dependency(%q<erubi>.freeze, [">= 1.10.0".freeze])
  s.add_runtime_dependency(%q<sorbet-static-and-runtime>.freeze, [">= 0.5.10187".freeze])
  s.add_runtime_dependency(%q<syntax_tree>.freeze, [">= 6.1.1".freeze])
  s.add_runtime_dependency(%q<thor>.freeze, [">= 0.19.2".freeze])
end

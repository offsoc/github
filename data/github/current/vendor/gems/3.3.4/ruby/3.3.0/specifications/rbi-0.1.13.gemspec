# -*- encoding: utf-8 -*-
# stub: rbi 0.1.13 ruby lib

Gem::Specification.new do |s|
  s.name = "rbi".freeze
  s.version = "0.1.13".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Alexandre Terrasa".freeze]
  s.date = "2024-05-06"
  s.email = ["ruby@shopify.com".freeze]
  s.homepage = "https://github.com/Shopify/rbi".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 3.1".freeze)
  s.rubygems_version = "3.5.9".freeze
  s.summary = "RBI generation framework".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<prism>.freeze, [">= 0.18.0".freeze, "< 1.0.0".freeze])
  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, [">= 0.5.9204".freeze])
end

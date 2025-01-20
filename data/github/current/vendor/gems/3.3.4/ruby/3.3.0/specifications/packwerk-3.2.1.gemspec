# -*- encoding: utf-8 -*-
# stub: packwerk 3.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "packwerk".freeze
  s.version = "3.2.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org", "changelog_uri" => "https://github.com/Shopify/packwerk/releases", "homepage_uri" => "https://github.com/Shopify/packwerk", "source_code_uri" => "https://github.com/Shopify/packwerk" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Shopify Inc.".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-05-02"
  s.description = "Sets package level boundaries between a specified set of ruby\nconstants to minimize cross-boundary referencing and dependency.\n".freeze
  s.email = ["gems@shopify.com".freeze]
  s.executables = ["packwerk".freeze]
  s.files = ["exe/packwerk".freeze]
  s.homepage = "https://github.com/Shopify/packwerk".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.7".freeze)
  s.rubygems_version = "3.5.9".freeze
  s.summary = "Packages for applications based on the zeitwerk autoloader".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activesupport>.freeze, [">= 6.0".freeze])
  s.add_runtime_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<constant_resolver>.freeze, [">= 0.2.0".freeze])
  s.add_runtime_dependency(%q<parallel>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, [">= 0.5.9914".freeze])
  s.add_runtime_dependency(%q<zeitwerk>.freeze, [">= 2.6.1".freeze])
  s.add_runtime_dependency(%q<ast>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<parser>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<prism>.freeze, [">= 0.25.0".freeze])
  s.add_runtime_dependency(%q<better_html>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<railties>.freeze, [">= 0".freeze])
end

# -*- encoding: utf-8 -*-
# stub: packwerk-extensions 0.3.0 ruby lib

Gem::Specification.new do |s|
  s.name = "packwerk-extensions".freeze
  s.version = "0.3.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "allowed_push_host" => "https://rubygems.org", "changelog_uri" => "https://github.com/rubyatscale/packwerk-extensions/releases", "homepage_uri" => "https://github.com/rubyatscale/packwerk-extensions", "source_code_uri" => "https://github.com/rubyatscale/packwerk-extensions" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Gusto Engineers".freeze]
  s.date = "2024-06-28"
  s.description = "A collection of extensions for packwerk packages.".freeze
  s.email = ["dev@gusto.com".freeze]
  s.homepage = "https://github.com/rubyatscale/packwerk-extensions".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.7".freeze)
  s.rubygems_version = "3.5.11".freeze
  s.summary = "A collection of extensions for packwerk packages.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<packwerk>.freeze, [">= 2.2.1".freeze])
  s.add_runtime_dependency(%q<railties>.freeze, [">= 6.0.0".freeze])
  s.add_runtime_dependency(%q<sorbet-runtime>.freeze, [">= 0".freeze])
  s.add_runtime_dependency(%q<zeitwerk>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<minitest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<mocha>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pry>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sorbet>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<sorbet-static>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<tapioca>.freeze, [">= 0".freeze])
end

# -*- encoding: utf-8 -*-
# stub: rich_text_renderer 0.2.2 ruby lib

Gem::Specification.new do |s|
  s.name = "rich_text_renderer".freeze
  s.version = "0.2.2".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Contentful GmbH (David Litvak Bruno)".freeze]
  s.date = "2019-05-22"
  s.description = "Rich Text Renderer for the Contentful RichText field type".freeze
  s.email = "rubygems@contentful.com".freeze
  s.homepage = "https://github.com/contentful/rich-text-renderer.rb".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.0.3".freeze
  s.summary = "Rich Text Renderer for the Contentful RichText field type".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<bundler>.freeze, ["~> 1.5".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["< 11.0".freeze])
  s.add_development_dependency(%q<rubygems-tasks>.freeze, ["~> 0.2".freeze])
  s.add_development_dependency(%q<guard>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<guard-rspec>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<guard-rubocop>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<guard-yard>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<yard>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 0.49.1".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3".freeze])
  s.add_development_dependency(%q<simplecov>.freeze, [">= 0".freeze])
end

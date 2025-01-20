# -*- encoding: utf-8 -*-
# stub: monetize 1.13.0 ruby lib

Gem::Specification.new do |s|
  s.name = "monetize".freeze
  s.version = "1.13.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "bug_tracker_uri" => "https://github.com/RubyMoney/monetize/issues", "changelog_uri" => "https://github.com/RubyMoney/monetize/blob/master/CHANGELOG.md", "source_code_uri" => "https://github.com/RubyMoney/monetize/" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Shane Emmons".freeze, "Anthony Dmitriyev".freeze]
  s.date = "2024-01-29"
  s.description = "A library for converting various objects into `Money` objects.".freeze
  s.email = ["shane@emmons.io".freeze, "anthony.dmitriyev@gmail.com".freeze]
  s.homepage = "https://github.com/RubyMoney/monetize".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.3".freeze
  s.summary = "A library for converting various objects into `Money` objects.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<money>.freeze, ["~> 6.12".freeze])
  s.add_development_dependency(%q<bundler>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 10.2".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0".freeze])
end

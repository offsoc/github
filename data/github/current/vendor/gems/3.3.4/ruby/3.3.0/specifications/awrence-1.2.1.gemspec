# -*- encoding: utf-8 -*-
# stub: awrence 1.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "awrence".freeze
  s.version = "1.2.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Dave Hrycyszyn".freeze, "Stuart Chinery".freeze]
  s.date = "2021-02-18"
  s.description = "Have you ever needed to automatically convert Ruby-style snake_case to CamelCase or camelBack hash keys?\n\nAwrence to the rescue.\n\nThis gem recursively converts all snake_case keys in a hash structure to camelBack.".freeze
  s.email = ["dave@constructiveproof.com".freeze, "code@technicalpanda.co.uk".freeze]
  s.homepage = "https://github.com/technicalpanda/awrence".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.5".freeze)
  s.rubygems_version = "3.1.4".freeze
  s.summary = "Camelize your snake keys when working with JSON APIs".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<byebug>.freeze, ["~> 11.1".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.14".freeze])
  s.add_development_dependency(%q<minitest-fail-fast>.freeze, ["~> 0.1".freeze])
  s.add_development_dependency(%q<minitest-macos-notification>.freeze, ["~> 0.3".freeze])
  s.add_development_dependency(%q<minitest-reporters>.freeze, ["~> 1.4".freeze])
  s.add_development_dependency(%q<rake>.freeze, ["~> 13.0".freeze])
  s.add_development_dependency(%q<rubocop>.freeze, ["~> 1.7".freeze])
  s.add_development_dependency(%q<rubocop-minitest>.freeze, ["~> 0.10".freeze])
  s.add_development_dependency(%q<rubocop-rake>.freeze, ["~> 0.5".freeze])
end

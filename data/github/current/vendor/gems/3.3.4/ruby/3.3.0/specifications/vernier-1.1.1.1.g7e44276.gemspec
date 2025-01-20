# -*- encoding: utf-8 -*-
# stub: vernier 1.1.1.1.g7e44276 ruby lib
# stub: ext/vernier/extconf.rb

Gem::Specification.new do |s|
  s.name = "vernier".freeze
  s.version = "1.1.1.1.g7e44276".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "changelog_uri" => "https://github.com/jhawthorn/vernier", "homepage_uri" => "https://github.com/jhawthorn/vernier", "source_code_uri" => "https://github.com/jhawthorn/vernier" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["John Hawthorn".freeze]
  s.bindir = "exe".freeze
  s.date = "2024-07-11"
  s.description = "Next-generation Ruby 3.2.1+ sampling profiler. Tracks multiple threads, GVL activity, GC pauses, idle time, and more.".freeze
  s.email = ["john@hawthorn.email".freeze]
  s.executables = ["vernier".freeze]
  s.extensions = ["ext/vernier/extconf.rb".freeze]
  s.files = ["exe/vernier".freeze, "ext/vernier/extconf.rb".freeze]
  s.homepage = "https://github.com/jhawthorn/vernier".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.5.11".freeze
  s.summary = "A next generation CRuby profiler".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<activesupport>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<gvltest>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<rack>.freeze, [">= 0".freeze])
end

# -*- encoding: utf-8 -*-
# stub: unicode-confusable 1.7.0 ruby lib

Gem::Specification.new do |s|
  s.name = "unicode-confusable".freeze
  s.version = "1.7.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Jan Lelis".freeze]
  s.date = "2020-03-11"
  s.description = "[Unicode 13.0.0] Compares two strings if they are visually confusable as described in Unicode\u00AE Technical Standard #39: Both strings get transformed into a skeleton format before comparing them. The skeleton is generated by normalizing the string, replacing confusable characters, and then normalizing the string again.".freeze
  s.email = ["hi@ruby.consulting".freeze]
  s.homepage = "https://github.com/janlelis/unicode-confusable".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.2".freeze)
  s.rubygems_version = "3.1.2".freeze
  s.summary = "Detect characters that look visually similar.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version
end

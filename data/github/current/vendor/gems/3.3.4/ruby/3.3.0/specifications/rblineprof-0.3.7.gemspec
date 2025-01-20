# -*- encoding: utf-8 -*-
# stub: rblineprof 0.3.7 ruby lib
# stub: ext/extconf.rb

Gem::Specification.new do |s|
  s.name = "rblineprof".freeze
  s.version = "0.3.7".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Aman Gupta".freeze]
  s.date = "2016-07-13"
  s.description = "rblineprof shows you lines of code that are slow.".freeze
  s.email = "aman@tmm1.net".freeze
  s.extensions = ["ext/extconf.rb".freeze]
  s.files = ["ext/extconf.rb".freeze]
  s.homepage = "http://github.com/tmm1/rblineprof".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.4.5.1".freeze
  s.summary = "line-profiler for ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<debugger-ruby_core_source>.freeze, ["~> 1.3".freeze])
  s.add_development_dependency(%q<rake-compiler>.freeze, [">= 0".freeze])
end

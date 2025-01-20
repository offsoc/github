# -*- encoding: utf-8 -*-
# stub: statsd-ruby 0.3.0.github.3.38.gd478cc7 ruby lib

Gem::Specification.new do |s|
  s.name = "statsd-ruby".freeze
  s.version = "0.3.0.github.3.38.gd478cc7".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Rein Henrichs".freeze]
  s.date = "2011-06-24"
  s.description = "A Statsd client in Ruby".freeze
  s.email = "rein@phpfog.com".freeze
  s.extra_rdoc_files = ["LICENSE.txt".freeze, "README.rdoc".freeze]
  s.files = ["LICENSE.txt".freeze, "README.rdoc".freeze]
  s.homepage = "http://github.com/reinh/statsd".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "2.0.14.1".freeze
  s.summary = "A Statsd client in Ruby".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<rake>.freeze, ["~> 11.2".freeze])
  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.9".freeze])
end

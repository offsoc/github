# -*- encoding: utf-8 -*-
# stub: prelude-batch-loader 0.0.5.r09fbb3d ruby lib

Gem::Specification.new do |s|
  s.name = "prelude-batch-loader".freeze
  s.version = "0.0.5.r09fbb3d".freeze

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["John Crepezzi".freeze]
  s.date = "2022-06-03"
  s.email = "john.crepezzi@gmail.com".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.2.5".freeze
  s.summary = "ActiveRecord custom preloading".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<activerecord>.freeze, [">= 6".freeze])
  s.add_development_dependency(%q<rspec>.freeze, ["~> 3".freeze])
  s.add_development_dependency(%q<sqlite3>.freeze, ["~> 1.4".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
  s.add_development_dependency(%q<pry>.freeze, [">= 0".freeze])
end

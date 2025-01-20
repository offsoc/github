# -*- encoding: utf-8 -*-
# stub: allocation_sampler 1.0.0 ruby lib
# stub: ext/allocation_sampler/extconf.rb

Gem::Specification.new do |s|
  s.name = "allocation_sampler".freeze
  s.version = "1.0.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Aaron Patterson".freeze]
  s.date = "2019-01-14"
  s.description = "A sampling allocation profiler.  This keeps track of allocations, but only on\nspecified intervals.  Useful for profiling allocations in programs where there\nis a time limit on completion of the program.".freeze
  s.email = ["aaron@tenderlovemaking.com".freeze]
  s.extensions = ["ext/allocation_sampler/extconf.rb".freeze]
  s.extra_rdoc_files = ["CHANGELOG.md".freeze, "Manifest.txt".freeze, "README.md".freeze]
  s.files = ["CHANGELOG.md".freeze, "Manifest.txt".freeze, "README.md".freeze, "ext/allocation_sampler/extconf.rb".freeze]
  s.homepage = "https://github.com/tenderlove/allocation_sampler".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = ["--main".freeze, "README.md".freeze]
  s.rubygems_version = "3.0.2".freeze
  s.summary = "A sampling allocation profiler".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_development_dependency(%q<minitest>.freeze, ["~> 5.11".freeze])
  s.add_development_dependency(%q<rdoc>.freeze, [">= 4.0".freeze, "< 7".freeze])
  s.add_development_dependency(%q<hoe>.freeze, ["~> 3.17".freeze])
end

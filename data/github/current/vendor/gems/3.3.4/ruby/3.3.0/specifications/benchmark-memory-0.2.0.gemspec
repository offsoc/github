# -*- encoding: utf-8 -*-
# stub: benchmark-memory 0.2.0 ruby lib

Gem::Specification.new do |s|
  s.name = "benchmark-memory".freeze
  s.version = "0.2.0".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Michael Herold".freeze]
  s.date = "2021-11-03"
  s.description = "Benchmark-style memory profiling".freeze
  s.email = ["michael.j.herold@gmail.com".freeze]
  s.homepage = "https://github.com/michaelherold/benchmark-memory".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.5.0".freeze)
  s.rubygems_version = "3.2.22".freeze
  s.summary = "Benchmark-style memory profiling".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<memory_profiler>.freeze, ["~> 1".freeze])
end

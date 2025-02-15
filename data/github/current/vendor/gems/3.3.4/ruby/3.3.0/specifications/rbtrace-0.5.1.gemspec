# -*- encoding: utf-8 -*-
# stub: rbtrace 0.5.1 ruby lib ext
# stub: ext/extconf.rb

Gem::Specification.new do |s|
  s.name = "rbtrace".freeze
  s.version = "0.5.1".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze, "ext".freeze]
  s.authors = ["Aman Gupta".freeze]
  s.date = "2023-12-19"
  s.description = "rbtrace shows you method calls happening inside another ruby process in real time.".freeze
  s.email = "aman@tmm1.net".freeze
  s.executables = ["rbtrace".freeze]
  s.extensions = ["ext/extconf.rb".freeze]
  s.files = ["bin/rbtrace".freeze, "ext/extconf.rb".freeze]
  s.homepage = "http://github.com/tmm1/rbtrace".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.4.19".freeze
  s.summary = "rbtrace: like strace but for ruby code".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<ffi>.freeze, [">= 1.0.6".freeze])
  s.add_runtime_dependency(%q<optimist>.freeze, [">= 3.0.0".freeze])
  s.add_runtime_dependency(%q<msgpack>.freeze, [">= 0.4.3".freeze])
  s.add_development_dependency(%q<rake>.freeze, [">= 0".freeze])
end

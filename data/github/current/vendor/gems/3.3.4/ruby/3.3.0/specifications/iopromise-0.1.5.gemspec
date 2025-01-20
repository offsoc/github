# -*- encoding: utf-8 -*-
# stub: iopromise 0.1.5 ruby lib

Gem::Specification.new do |s|
  s.name = "iopromise".freeze
  s.version = "0.1.5".freeze

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.metadata = { "homepage_uri" => "https://github.com/theojulienne/iopromise", "source_code_uri" => "https://github.com/theojulienne/iopromise" } if s.respond_to? :metadata=
  s.require_paths = ["lib".freeze]
  s.authors = ["Theo Julienne".freeze]
  s.bindir = "exe".freeze
  s.date = "2021-08-11"
  s.description = "This gem extends promise.rb promises to support an extremely simple pattern for \"continuing\" execution of the promise in an asynchronous non-blocking way.".freeze
  s.email = ["theo.julienne@gmail.com".freeze]
  s.homepage = "https://github.com/theojulienne/iopromise".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4.0".freeze)
  s.rubygems_version = "3.2.9".freeze
  s.summary = "Simple non-blocking IO promises for Ruby.".freeze

  s.installed_by_version = "3.5.11".freeze if s.respond_to? :installed_by_version

  s.specification_version = 4

  s.add_runtime_dependency(%q<promise.rb>.freeze, ["~> 0.7.4".freeze])
  s.add_runtime_dependency(%q<nio4r>.freeze, [">= 0".freeze])
end

# frozen_string_literal: true

lib = File.expand_path('lib', __dir__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'github/kv/version'

Gem::Specification.new do |spec|
  spec.name          = 'github-kv'
  spec.version       = GitHub::KV::VERSION
  spec.authors       = ['GitHub Open Source', 'Matthew Draper', 'Ahmed Shahin']
  spec.email         = ['opensource+github-kv@github.com', 'matthew@trebex.net', 'ahmed.samir.mohamed88@gmail.com']

  spec.summary       = 'A key/value data store backed by MySQL.'
  spec.description   = 'A key/value data store backed by MySQL.'
  spec.homepage      = 'https://github.com/github/github-kv'
  spec.license       = 'MIT'

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    spec.metadata['allowed_push_host'] = 'https://rubygems.org'
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
      'public gem pushes.'
  end

  spec.files = `git ls-files -z`.split("\x0").reject do |f|
    f.match(%r{^(test|spec|features)/})
  end
  spec.bindir        = 'exe'
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ['lib']

  spec.add_dependency 'activerecord', '>= 6.1'
  spec.add_development_dependency 'bundler', '>= 1.14'
  spec.add_development_dependency 'minitest', '~> 5.19'
  spec.add_development_dependency 'minitest-focus', '~> 1.1.2'
  spec.add_development_dependency 'mocha', '~> 1.2.1'
  spec.add_development_dependency 'mysql2'
  spec.add_development_dependency 'pry', '~> 0.12.2'
  spec.add_development_dependency 'rake', '~> 12.0'
  spec.add_development_dependency 'rubocop-github'
  spec.add_development_dependency 'timecop'
end

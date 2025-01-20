require File.expand_path('../lib/prose_diff/version', __FILE__)

Gem::Specification.new do |gem|
  gem.name          = ProseDiff.gem_name
  gem.version       = ProseDiff.semantic_version
  gem.authors       = ["Reg Braithwaite"]
  gem.email         = ["reg.braithwaite@github.com"]
  gem.description   = "Calculate and render diffs of HTML trees."
  gem.summary       = "Make diffs look pretty."
  gem.homepage      = "https://github.com/github/prose_diff"

  gem.files         = `git ls-files`.split $/
  gem.executables   = []
  gem.test_files    = gem.files.grep /^test/
  gem.require_paths = ["lib"]

  gem.add_runtime_dependency "diff-lcs", "~>1.4"
  gem.add_runtime_dependency "nokogiri", "~> 1.6"
  gem.add_runtime_dependency "ffi", "~> 1.9"
  gem.add_runtime_dependency "levenshtein-ffi"

  gem.add_development_dependency "rspec"

  gem.add_development_dependency 'guard', '~>1.8'
  gem.add_development_dependency 'ruby-prof'
  gem.add_development_dependency 'guard-rspec'
  gem.add_development_dependency 'rb-fsevent'
  gem.add_development_dependency 'guard-sass'
  gem.add_development_dependency 'sass'
end

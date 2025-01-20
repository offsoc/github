Gem::Specification.new do |gem|
  gem.name          = 'pathname-common_prefix'
  gem.version       = '0.0.1'
  gem.authors       = ['KITAITI Makoto']
  gem.email         = ['KitaitiMakoto@gmail.com']
  gem.description   = 'This file provides `Pathname.common_prefix` and `Pathname#common_prefix` which calcurate the common prefix in the passed paths.'
  gem.summary       = 'Calcurate prefix commont to some pathnames'
  gem.homepage      = 'https://github.com/KitaitiMakoto/pathname-common_prefix'

  gem.files         = %w[
                         lib/pathname/common_prefix.rb
                         test/test_common_prefix.rb
                         bin/common-prefix
                         README.markdown
                         Rakefile setup.rb
                         pathname-common_prefix.gemspec
                      ]
  gem.executables   = %w[common-prefix]
  gem.test_files    = %w[test/test_common_prefix.rb]
  gem.require_paths = %w[lib]
end

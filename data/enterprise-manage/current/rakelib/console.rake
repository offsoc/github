# frozen_string_literal: true

desc "Open an irb session preloaded with this library"
task :console do
  sh "irb -I ./lib -r manage.rb"
end

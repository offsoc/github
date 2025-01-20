# frozen_string_literal: true
%w( development production ).each do |env|
  desc "Runs the following task in the #{env} environment"
  task env do
    ENV["RAILS_ENV"] = env
  end
end

task :dev     => :development
task :prod    => :production

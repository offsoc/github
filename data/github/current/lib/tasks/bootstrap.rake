# frozen_string_literal: true
namespace :bootstrap do
  desc "Setup local nginx for running http://github.localhost"
  task :nginx do
    path = `which nginx`.chomp
    fail "Unable to find nginx" if path == ""
    path.gsub!(%r!/sbin/nginx!, "")

    puts "Found nginx installed at #{path}"

    github_repo_path  = ENV["GITHUB_PATH"] || "/Volumes/GitHub/github"
    nginx_config_path = File.join(github_repo_path, "config/dev/nginx.conf")

    if !File.file?(nginx_config_path)
      puts "Cannot find #{nginx_config_path.inspect}."
      puts "If your GitHub repo is not at #{github_repo_path.inspect}, specify it with GITHUB_PATH."
      puts
      puts "GITHUB_PATH=$(pwd) bin/rake bootstrap:nginx"
      exit
    end

    `sudo cp #{nginx_config_path} #{path}/etc/nginx/nginx.conf`
    `sed -ie "s,user nobody,user #{ENV["USER"]} staff," #{path}/etc/nginx/nginx.conf`
    `ps aux | grep -v rake | grep nginx | awk '{print $2}' | xargs sudo kill -9`
    `sudo nginx`
    puts "Configured nginx and started the server"
  end
end

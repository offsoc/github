# frozen_string_literal: true

namespace :ldap do
  desc "Start the LDAP server for development."
  task :start do
    require "github/ldap/server"

    GitHub::Ldap.start_server(
      user_fixtures: File.expand_path("../test/fixtures/github.ldif", __dir__),
      port: 3840,
      quiet: false
    )

    options = GitHub::Ldap.server_options

    puts "Manage LDAP settings:"
    puts %(
  ldap_host    : "localhost"
  ldap_port    : 3840
  ldap_base    : "#{options[:user_domain]}"
  ldap_uid     : "uid"
  ldap_bind_dn : "#{options[:admin_user]}"
  ldap_password: "#{options[:admin_password]}"

)

    at_exit do
      GitHub::Ldap.stop_server
    end

    loop do
      # just wait
    end
  end
end

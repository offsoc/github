# frozen_string_literal: true
namespace :ldap do
  require "pathname"
  LDAP_FIXTURES = Pathname(File.expand_path("../../../test/fixtures/misc", __FILE__))
  LDAP_USER_DOMAIN = ENV["LDAP_USER_DOMAIN"]
  DEFAULT_LDIF     = ENV.fetch("LDAP_LDIF", "github")
  LDAP_COMPANY     = ENV.fetch("LDAP_COMPANY", "github")
  LDAP_ADMIN       = ENV.fetch("LDAP_ADMIN", "uid=admin,ou=users,dc=#{LDAP_COMPANY},dc=com")

  CONFIG_BASE = {
    :auth_mode         => "ldap",
    :ldap_base         => ["ou=users,dc=#{LDAP_COMPANY},dc=com", "ou=teams,dc=#{LDAP_COMPANY},dc=com"],
    :ldap_profile_uid  => "uid",
    :ldap_profile_mail => "mail",
    :ldap_profile_key  => "sshPublicKey",
    :ldap_profile_gpg_key => "pgpKey",
    :ldap_bind_dn      => LDAP_ADMIN,
    :ldap_password     => "secret",
    :ldap_method       => "Plain",
    :ldap_admin_group  => "administrators",
    :ldap_user_groups  => [],
    :ldap_sync_enabled => true,
    :ldap_user_sync_emails => true,
    :ldap_user_sync_keys   => true,
    :ldap_user_sync_skip_empty_keys => false,
    :ldap_user_sync_gpg_keys => true
  }

  def write_github_config(config)
    File.open("config.yml", "w") do |f|
      f.write(CONFIG_BASE.merge(config).to_yaml)
    end
    puts "GitHub configured to sign in with LDAP"

    at_exit do
      File.unlink("config.yml") if File.exist?("config.yml")
    end
  end

  def wait_for(name)
    puts "LDAP authentication connected with #{name} ..."
    loop do
      # just wait
      sleep 1
    end
  end

  # Development LDAP Auth Info.
  # To configure GitHub to use this server set these values in the base `config.yml` file:
  #
  # auth_mode    : 'ldap'
  # ldap_host    : "localhost"
  # ldap_port    : 3899
  # ldap_method  : 'plain'
  # ldap_base    : 'dc=github,dc=com'
  # ldap_profile : {'uid': 'uid'}
  # ldap_bind_dn : 'uid=admin,dc=github,dc=com'
  # ldap_password: GitHub.default_password
  #
  # If you want to test LDAP groups add this line to the configuration above:
  #
  # ldap_groups  : 'People, Enterprise'

  desc "Start the LDAP server for development."
  task :start => :environment do
    require "github/ldap/server"

    write_github_config(:ldap_host => "localhost", :ldap_port => 3899)

    puts "Starting LDAP server... this may take a minute or two."
    puts "You can go ahead and start the GitHub server while you wait."

    GitHub::Ldap.start_server(
      port: 3899,
      quiet: false,
      timeout: 120,
      user_domain: "dc=#{LDAP_COMPANY},dc=com",
      admin_user: LDAP_ADMIN,
      user_fixtures: LDAP_FIXTURES.join(DEFAULT_LDIF + ".ldif").to_s,
      custom_schemas: LDAP_FIXTURES.join("github-ldap-schema.ldif").to_s)

    at_exit { GitHub::Ldap.stop_server }

    wait_for("localhost:3899")
  end

  namespace :openldap do
    task :start => :environment do
      ldap_host = ENV.fetch("OPENLDAP_HOST", "localhost")
      ldap_port = ENV.fetch("OPENLDAP_PORT", 389)
      write_github_config \
        ldap_base: %w(ou=People,dc=openldap,dc=ghe,dc=local ou=Groups,dc=openldap,dc=ghe,dc=local),
        ldap_bind_dn: "cn=admin,dc=openldap,dc=ghe,dc=local",
        ldap_password: GitHub.default_password,
        ldap_admin_group: "ghe-admins",
        ldap_user_groups:  %w(ghe-users),
        ldap_host: ldap_host,
        ldap_port: ldap_port

      wait_for("enterprise2 OpenLDAP on #{ldap_host}:#{ldap_port}")
    end
  end

  namespace :ad do
    task :start => :environment do
      ldap_host = ENV.fetch("AD_HOST", "localhost")
      ldap_port = ENV.fetch("AD_PORT", 389)
      write_github_config \
        ldap_base: %w(CN=Users,DC=ad,DC=ghe,DC=local),
        ldap_profile_uid: "sAMAccountName",
        ldap_bind_dn: "CN=Administrator,CN=Users,DC=ad,DC=ghe,DC=local",
        ldap_password: GitHub.default_password,
        ldap_admin_group: "ghe-admins",
        ldap_user_groups:  %w(ghe-users),
        ldap_host: ldap_host,
        ldap_port: ldap_port

      wait_for("enterprise2 ActiveDirectory #{ldap_host}:#{ldap_port}")
    end
  end

  desc "Connect to ldap.githubapp.com"
  task :open_connect do
    write_github_config(:ldap_host => "ldap.githubapp.com", :ldap_port => 389)

    wait_for("ldap.githubapp.com")
  end

  # This is a development task, use under your own risk.
  desc "Create users for each person in the ldap directory with access granted"
  task :user_migrate => :environment do
    return unless GitHub.auth.ldap?

    people = []
    GitHub.auth.ldap_domains.each_value do |domain|
      people.concat domain.search({ :filter => Net::LDAP::Filter.eq("objectClass", "inetOrgPerson") })
    end

    people.each do |entry|
      if GitHub.auth.access_granted?(entry)
        login = GitHub.auth.profile_info(entry, :uid).first
        puts "Creating user for #{login}"

        GitHub.auth.find_or_create_user(login, entry)
      end
    end
  end

  desc "Replicate GitHub members to use ldap authentication"
  task :user_replicate => :environment do
    require "open-uri"
    require "yaml"
    require "octokit"
    require "sshkey"
    require "github/ldap/server"

    Octokit.auto_paginate = true
    puts "Getting GitHub org members"
    github_members = client.org_members("github")

    ldap_members = github_members.map do |member|
      {
        :dn           => "uid=#{member.login},ou=users,dc=github,dc=com",
        :cn           => member.login,
        :sn           => member.login,
        :uid          => member.login,
        :userPassword => GitHub.default_password,
        :mail         => "#{member.login}@github.com",
        :objectClass  => %w[inetOrgPerson user],
        :sshPublicKey => SSHKey.generate.ssh_public_key
      }
    end

    ldif = ENV["GITHUB_LDIF"] || File.join(LDAP_FIXTURES, "github.ldif")
    File.open(ldif, "w") do |members_file|
      write_base_orgs(members_file)

      members_file.puts

      ldap_members.each do |member|
        member.each do |key, value|
          if value.respond_to?(:each)
            value.each { |v| members_file.puts "#{key}: #{v}" }
          else
            members_file.puts "#{key}: #{value}"
          end
        end
        members_file.puts
      end

      write_admin(members_file)
      write_engineering(members_file)
      write_product(members_file)
      write_github_teams(members_file)
    end
  end

  def write_admin(members_file)
    members_file.puts """dn: uid=admin,ou=users,dc=github,dc=com
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: inetOrgPerson
cn: system administrator
sn: administrator
displayName: Directory Superuser
uid: admin
userPassword: secret
mail: admin@github.com

dn: cn=administrators,ou=teams,dc=github,dc=com
objectclass: groupOfNames
member: uid=admin,ou=users,dc=github,dc=com
"""
  end

  def write_base_orgs(members_file)
    members_file.puts """version: 1

# Domain information is automatically created by ApacheDS in testing so not defined here.

# ORGS

dn: ou=teams,dc=github,dc=com
ou: teams
objectclass: organizationalUnit

dn: ou=users,dc=github,dc=com
ou: users
objectclass: organizationalUnit
"""
  end

  def write_engineering(members_file)
    members_file.puts """# Engineering

dn: cn=engineering,ou=teams,dc=github,dc=com
cn: engineering
objectclass: groupOfNames
member: cn=desktop,ou=teams,dc=github,dc=com
member: cn=systems,ou=teams,dc=github,dc=com
member: cn=tools,ou=teams,dc=github,dc=com
member: cn=web,ou=teams,dc=github,dc=com
"""
  end

  def write_product(members_file)

    product_api_members = members("atmos")

    product_core_web_members = members("tclem", "ben", "cobyism", "holman")

    product_native_members = members("orderedlist", "dannygreg", "tobiasahlin")

    product_web_members = members("connors", "cjh", "fabianperez", "jglober", "mattgraham", "nrrrdcore", "nakajima", "mdo", "dewski")

    product_research_members = members("chrissiebrodigan", "jdmaturen")

    members_file.puts """# Product

dn: cn=product-team,ou=teams,dc=github,dc=com
cn: product-team
objectclass: groupOfNames
member: uid=kneath,ou=users,dc=github,dc=com
member: cn=api,ou=teams,dc=github,dc=com
member: cn=core-web,ou=teams,dc=github,dc=com
member: cn=native,ou=teams,dc=github,dc=com
member: cn=product-web,ou=teams,dc=github,dc=com
member: cn=research,ou=teams,dc=github,dc=com

dn: cn=product-api,ou=teams,dc=github,dc=com
cn: product-api
objectclass: groupOfNames
#{product_api_members}

dn: cn=core-web,ou=teams,dc=github,dc=com
cn: core-web
objectclass: groupOfNames
#{product_core_web_members}

dn: cn=product-native,ou=teams,dc=github,dc=com
cn: product-native
objectclass: groupOfNames
#{product_native_members}

dn: cn=product-web,ou=teams,dc=github,dc=com
cn: product-web
objectclass: groupOfNames
#{product_web_members}

dn: cn=product-research,ou=teams,dc=github,dc=com
cn: product-research
objectclass: groupOfNames
#{product_research_members}
"""
  end

  def write_github_teams(members_file)
    entries = github_team_members.map do |team, team_members|
      uids = team_members.map { |member| member.login }

      """
dn: cn=#{team.name},ou=teams,dc=github,dc=com
cn: #{team.name}
objectclass: groupOfNames
#{members(*uids)}
"""
    end

    members_file.puts """# GitHub teams
#{entries.join("\n")}
"""

  end

  def member(uid)
    "member: uid=#{uid},ou=users,dc=github,dc=com"
  end

  def members(*uids)
    uids.map { |uid| member(uid) }.join("\n")
  end

  def client
    @client ||= Octokit::Client.new(:login => hub["user"], :access_token => hub["oauth_token"])
  end

  def hub
    @hub ||= YAML.load_file(File.expand_path("~/.config/hub"))["github.com"][0]
  end

  def github_teams
    client.org_teams("github")
  end

  def github_team_members
    github_teams.each_with_object({}) do |team, hash|
      next if team.legacy_owners?

      puts "Getting #{team.name} members"
      members = client.team_members(team.id)
      hash[team] = members unless members.empty?
    end
  end
end

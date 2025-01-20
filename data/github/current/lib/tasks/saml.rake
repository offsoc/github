# frozen_string_literal: true
namespace :saml do
  require "pathname"
  IDP_HOST = "idp.github.localhost"
  SSO_URL  = "https://#{IDP_HOST}/idp/profile/SAML2/Redirect/SSO"
  SAML_FIXTURES = Pathname(File.expand_path("../../../test/fixtures/misc", __FILE__))
  CONFIGS = Pathname(File.expand_path("../../../config/dev/saml", __FILE__))
  GITHUB_ROOT = Pathname(File.expand_path("../../../", __FILE__))
  TMP_FOLDER = Pathname(File.expand_path("../../../tmp", __FILE__))
  DEFAULT_DEVTOOLS_HOST = "https://saml-devtools-production.service.iad.github.net"

  # Development idP server
  #
  # This task starts the backing LDAP server that Shibboleth idP is configured
  # to use for authentication. It configures the LDAP server with the following
  # options:
  #
  # auth_mode: 'saml'
  # idp:
  #   sso_url:         "http://idp.github.localhost/profile/SAML2/Redirect/SSO"
  #   slo_url:         "http://idp.github.localhost/profile/SAML2/Redirect/SLO"
  #
  # The idP configured to pull users from LDAP. `config.yml` needs to have LDAP
  # connection configuration:
  #
  # ldap_host    : "localhost"
  # ldap_port    : 3899
  # ldap_method  : 'plain'
  # ldap_base    : 'dc=github,dc=com'
  # ldap_profile : {'uid': 'uid'}
  # ldap_bind_dn : 'uid=admin,dc=github,dc=com'
  # ldap_password: GitHub.default_password
  #
  desc "Start the SAML identity provider for development"
  task :start => :environment do
    require "github/ldap/server"

    puts "Starting LDAP to use as authentication backend..."
    GitHub::Ldap.start_server(
      :port => 3899,
      :quiet => false,
      :user_fixtures => SAML_FIXTURES.join("github.ldif").to_s,
      :custom_schemas => SAML_FIXTURES.join("github-ldap-schema.ldif").to_s)

    config  = {
      :auth_mode => :saml,
      :saml_sso_url => SSO_URL,
      :saml_certificate_file => "/opt/shibboleth-idp/credentials/idp-signing.crt",
      :saml_sp_pkcs12_file => SAML_FIXTURES.join("saml/sp.p12").to_s
    }

    File.open("config.yml", "w") do |f|
      f.write(config.to_yaml)
      f.flush
    end

    puts "GitHub configured to sign in with SAML."

    at_exit do
      File.unlink("config.yml") if File.exist?("config.yml")
      GitHub::Ldap.stop_server
      `launchctl stop dev.tomcat8`
    end

    ## NGINX configuration

    SHIB_NGINX = <<-EOS.gsub(/^ */, "")
      upstream shibboleth-idp { server 127.0.0.1:8081; }
      server {
      access_log #{GITHUB_ROOT}/log/shibboleth.access.log;
      listen 8080;
      listen [::]:8080;
      listen 8443 ssl;
      listen [::]:8443 ssl;
      ssl_certificate #{GITHUB_ROOT}/config/dev/ssl/github.localhost.crt;
      ssl_certificate_key #{GITHUB_ROOT}/config/dev/ssl/github.localhost.key;
      server_name idp.github.localhost;
      location / { proxy_pass http://shibboleth-idp; proxy_set_header Host idp.github.localhost; }
      }
    EOS

    File.open("/usr/local/etc/nginx/servers/shibboleth", "w") { |f| f.write(SHIB_NGINX) }
    `nginx -s reload`

    ## Tomcat 8 installation and configuration
    puts "Installing Tomcat"
    # GitHub RUBYOPT doesn't work with system ruby used by brew
    puts  `RUBYOPT='' brew install file://#{CONFIGS}/tomcat/tomcat8.rb`
    CATALINA_BASE = `catalina version | grep 'CATALINA_BASE.*/usr/.*tomcat' | awk '{print $3}'`.chomp
    if !File.directory?(CATALINA_BASE)
      puts "Tomcat failed to install. Run `brew install file://#{CONFIGS}/tomcat/tomcat8.rb` manually to check for errors."
      exit 1
    end
    WEBROOT = CATALINA_BASE + "/webapps"
    CATALINA_CONF = CATALINA_BASE + "/conf/server.xml"
    if File.directory?("#{WEBROOT}/idp")
      `rm -rf #{WEBROOT}/idp`
    end

    # Tomcat server.xml
    `cat #{CONFIGS}/tomcat/server.xml >  #{CATALINA_CONF}`

    # Tomcat IDP.xml
    `mkdir -p #{CATALINA_BASE}/conf/Catalina/idp.github.localhost/`
    `cat #{CONFIGS}/tomcat/idp.xml >  #{CATALINA_BASE}/conf/Catalina/idp.github.localhost/idp.xml`

    # Tomcat launchd startup script
    TOMCAT8_PLIST = ENV["HOME"] + "/Library/LaunchAgents/dev.tomcat8.plist"
    `cat #{CONFIGS}/tomcat/dev.tomcat8.plist > #{ENV["HOME"]}/Library/LaunchAgents/dev.tomcat8.plist`
    `launchctl unload -w #{TOMCAT8_PLIST}`
    `launchctl load -w #{TOMCAT8_PLIST}`

    ## Shibboleth 3 IdP installation and configuration
    puts "Installing shibboleth idP."
    if system("grep github.localhost /opt/shibboleth-idp/conf/relying-party.xml")
      puts "Looks like Shibboleth is already configured. Remove /opt/shibboleth-idp to reset."
    else
      `sudo mkdir -p /opt/shibboleth-idp`
      `sudo chown #{ENV["USER"]} /opt/shibboleth-idp`
      `mkdir /opt/shibboleth-idp/src`
      SHIB_VERSION = "3.4.7"
      SHIB_DIRNAME = "shibboleth-identity-provider-#{SHIB_VERSION}"
      if File.file?("/opt/shibboleth-idp/src/#{SHIB_DIRNAME}.tar.gz")
        puts "Found /opt/shibboleth-idp/src/#{SHIB_DIRNAME}.tar.gz archive"
      else
        shib_url = "https://shibboleth.net/downloads/identity-provider/#{SHIB_VERSION}/#{SHIB_DIRNAME}.tar.gz"
        `curl #{shib_url} -o /opt/shibboleth-idp/src/#{SHIB_DIRNAME}.tar.gz`
      end

      `tar -C /opt/shibboleth-idp/src -xf /opt/shibboleth-idp/src/#{SHIB_DIRNAME}.tar.gz`

      SHIB_BUILD_PROP = <<-EOS.gsub(/^ */, "")
         #merged with conf/idp.properties . See also bin/build.xml.
         idp.entityID = https://idp.github.localhost
         idp.scope = github.localhost
         idp.sealer.storePassword = password
         idp.sealer.keyPassword = password
         idp.keystore.password = password
       EOS

      File.open("/opt/shibboleth-idp/src/#{SHIB_DIRNAME}/idp.github.properties", "w") { |f| f.write(SHIB_BUILD_PROP) }

      JAVA_HOME = `/usr/libexec/java_home`.chomp
      shib_install = "JAVA_HOME=#{JAVA_HOME} /opt/shibboleth-idp/src/#{SHIB_DIRNAME}/bin/install.sh " +
                     "-Didp.src.dir=/opt/shibboleth-idp/src/#{SHIB_DIRNAME} " +
                     "-Didp.target.dir=/opt/shibboleth-idp " +
                     "-Didp.host.name=idp.github.com -Didp.scope=github.localhost " +
                     "-Didp.keystore.password=password -Didp.sealer.password=password " +
                     "-Didp.merge.properties=/opt/shibboleth-idp/src/#{SHIB_DIRNAME}/idp.github.properties"
      `#{shib_install}`

      # Shibboleth configuration
      # If you want to try a different configuration, these are the files you
      # will need to update. If something doesn't seem to be taking, you may
      # need to rebuild the WAR with `cd /opt/shibboleth-idp; ./bin/build.sh`
      ["attribute-filter.xml", "attribute-resolver.xml", "idp.properties",
       "ldap.properties", "metadata-providers.xml", "relying-party.xml"].each do |f|
        `cat #{CONFIGS}/shibboleth/#{f} > /opt/shibboleth-idp/conf/#{f}`
      end

    end

    # Shibboleth gets angry if it can't hit http://github.localhost/saml/metadata, so preload
    metadata = `#{GITHUB_ROOT}/bin/runner 'puts GitHub.auth.metadata'`
    File.open("/opt/shibboleth-idp/metadata/github-dev.xml", "w") { |f| f.write(metadata) }

    puts "Starting shibboleth idP. Logs available at log/saml-idp.log"

    tomcat_pid = `launchctl list dev.tomcat8 | grep PID | awk '{ print $3; }' | sed 's/;$//'`.chomp

    # wait for tomcat to stop if we have to
    unless tomcat_pid.empty?
      puts "tomcat(#{tomcat_pid}) is running, trying to kill it."
      `launchctl stop dev.tomcat8`
      count = 0
      max = 10
      tomcat_stopped = loop do
        if count == max
          puts "tomcat pid didn't bounce."
          break false
        end
        tomcat_pid = `launchctl list dev.tomcat8 | grep PID | awk '{ print $3; }' | sed 's/;$//'`.chomp
        if tomcat_pid.empty?
          break true
        end
        count += 1
        sleep 1
      end

      puts "tomcat stopped" if tomcat_stopped
    end

    `launchctl start dev.tomcat8`
    puts "Giving tomcat just a second to catch it's breath..."
    sleep 5

    `ln -nfs /opt/shibboleth-idp/logs/idp-process.log #{File.expand_path("../../../log/saml-idp.log", __FILE__)}`

    puts "====================================================="
    puts "SAML authentication configured. Restart script/server."
    puts
    puts "Configuration: /opt/shibboleth-idp/conf"
    puts "SSO URL: #{config[:saml_sso_url]}"
    puts "idP Certificate: #{config[:saml_certificate_file]}"
    puts "SP PKCS12: #{config[:saml_sp_pkcs12_file]}"
    puts "Logout URL: https://idp.github.localhost/idp/profile/Logout"
    puts
    puts "Take a look at #{SAML_FIXTURES.join('github.ldif')} for a list of valid users."
    puts "Users in the *administrators* group are site administrators."
    puts
    puts "Remove config.yml to reset to default auth."

    loop do
      # just wait
      sleep 1
    end
  end

  namespace :shibboleth do
    desc "Start Shibboleth identity provider for development."
    task :start => ["saml:start"]
  end

  namespace :onelogin do
    desc "Start Onelogin identity provider for development."
    # https://app.onelogin.com/apps/421910/edit/#sso
    task :start do
      config  = {
        :auth_mode => :saml,
        :saml_sso_url => "https://app.onelogin.com/trust/saml2/http-post/sso/421910",
        :saml_certificate_file => SAML_FIXTURES.join("saml/onelogin.pem").to_s
      }

      File.open("config.yml", "w") do |f|
        f.write(config.to_yaml)
      end

      puts "SAML authentication configured. Restart script/server."
      puts
      puts "Configuration: https://app.onelogin.com/apps/421910/edit/#sso"
      puts "SSO URL: #{config[:saml_sso_url]}"
      puts "Certificate: #{config[:saml_certificate_file]}"
      puts
      puts "Remove config.yml to reset to default auth."
    end
  end

  namespace :okta do
    desc "Start Okta identity provider for development"
    task :start do
      config  = {
        :auth_mode => :saml,
        :saml_sso_url => "https://githubtest.okta.com/app/github_githubdev_1/exk10x9jpg5uJE7MU0i8/sso/saml",
        :saml_certificate_file => SAML_FIXTURES.join("saml/okta.pem").to_s
      }

      File.open("config.yml", "w") do |f|
        f.write(config.to_yaml)
      end

      puts "SAML authentication configured. Restart script/server."
      puts
      puts "Configuration: https://githubtest-admin.okta.com/admin/app/github_githubdev_1/instance/0oa10x9jpg66JdiFX0i8#tab-signon"
      puts "SSO URL: #{config[:saml_sso_url]}"
      puts "Certificate: #{config[:saml_certificate_file]}"
      puts
      puts "Remove config.yml to reset to default auth."
    end
  end

  namespace :azure do
    desc "Start Azure AD identity provider for development"
    task :start do
      config  = {
        :auth_mode => :saml,
        :saml_sso_url => "https://login.windows.net/f201642b-c96e-422b-8c6d-0c34c9bda3c8/saml2",
        :saml_certificate_file => SAML_FIXTURES.join("saml/azure.pem").to_s
      }

      File.open("config.yml", "w") do |f|
        f.write(config.to_yaml)
      end

      puts "SAML authentication configured. Restart script/server."
      puts
      puts "Configuration: https://manage.windowsazure.com/@jollyjerrygmail.onmicrosoft.com#Workspaces/ActiveDirectoryExtension/Directory/f201642b-c96e-422b-8c6d-0c34c9bda3c8/RegisteredApp/ddde9d83-974c-420f-a40b-eb3190a99f79/registeredAppQuickStart"
      puts "SSO URL: #{config[:saml_sso_url]}"
      puts "Certificate: #{config[:saml_certificate_file]}"
      puts
      puts "Remove config.yml to reset to default auth."
    end
  end

  namespace :codespaces_azure do
    desc "Setup Azure AD identity provider for GHES codespace development"
    task :start do
      config  = {
        :auth_mode => :saml,
        :saml_sso_url => "https://login.microsoftonline.com/8039e47d-8f9e-4f74-b0e8-9201aa7a4895/saml2",
        :saml_issuer => "https://sts.windows.net/8039e47d-8f9e-4f74-b0e8-9201aa7a4895/",
        :saml_certificate_file => SAML_FIXTURES.join("saml/ghes_azure.crt").to_s
      }

      File.open("config.yml", "w") do |f|
        f.write(config.to_yaml)
      end

      puts "SAML authentication configured. Restart script/server."
      puts
      puts "SSO URL: #{config[:saml_sso_url]}"
      puts "Certificate: #{config[:saml_certificate_file]}"
      puts
      puts "Remove config.yml to reset to default auth."
    end
  end

  namespace :devtools do
    desc "Configures the environment to use our SAML-DevTools instance"

    task :start do
      puts "You are about to configure your instance to use https://github.com/github/saml-devtools"
      host = ENV.fetch("SAML_DEVTOOLS_HOST", DEFAULT_DEVTOOLS_HOST)
      cert_path = TMP_FOLDER.join("saml-devtools.pem")
      puts "Using instance at #{host}"
      puts "Downloading idP certificate..."
      sh "curl -s #{host}/saml/download_idp_cert --output #{cert_path}"
      puts "Creating config.yml..."

      config  = {
        :auth_mode => :saml,
        :saml_sso_url => "#{host}/saml/sso",
        :saml_certificate_file => cert_path
      }

      File.open("config.yml", "w") do |f|
        f.write(config.to_yaml)
      end

      puts "Done! Now restart script/server."
      puts "Remember the idP is only accessible through the VPN!!"
      puts
      puts "SSO URL: #{config[:saml_sso_url]}"
      puts "Certificate: #{config[:saml_certificate_file]}"
      puts
      puts "Remove config.yml to reset to default auth."
    end
  end

  # Tasks related to Orgs+SAML SSO feature.
  namespace :orgs do
    ALLOWLIST = %w(
      gists/

      biztools/
      devtools/
      stafftools/

      admin/

      abstract_repository_controller.rb
      application_controller.rb

      repository_imports/base_controller.rb
    )

    # Reports controllers that don't explicitly skip the
    # `perform_conditional_access_checks` `before_action`.
    task :skip_report do
      controller_paths = Dir[Rails.root.join("app/controllers/**/*_controller.rb")]
      controller_paths.each do |path|
        next if ALLOWLIST.any? { |allowlisted| path.include?(allowlisted) }

        controller = File.read(path)

        if !controller.include?("skip_before_action :perform_conditional_access_checks")
          puts path
        end
      end
    end
  end
end

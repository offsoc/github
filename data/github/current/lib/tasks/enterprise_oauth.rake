# frozen_string_literal: true
namespace :enterprise do
  namespace :oauth do
    # Attach OAuth applications to the instance of GitHub running inside the Enterprise VM.
    #
    # app: is the name of the application to register.
    # client_id: is the generated auth client id. It can be found at /etc/github/APP_NAME_client_id.
    # secret: is the generated auth client secret. It can be found at /etc/github/APP_NAME_client_secret.
    #
    # Usage:
    #
    # Call this task from your cookbooks. This is an example with gist:
    #
    # client_id = "$(cat /etc/github/gist_oauth_client_id)"
    # secret    = "$(cat /etc/github/gist_oauth_secret)"
    #
    # bash 'setup gist oauth app' do
    #   source <<-CODE
    # . #{node.github.env_sh}
    # bin/rake "enterprise:oauth:add[gist,#{client_id},#{secret}]"
    # CODE
    # end
    #
    desc "create oauth app on the trusted user"
    task :add, [:app, :client_id, :secret, :url, :callback_url] => [:environment, "db:create_org"] do |_t, args|
      if GitHub.enterprise?
        OauthApplication.register_trusted_application(args[:app], args[:client_id], args[:secret], args[:url], args[:callback_url])
      end
    end

    task :add_hashed, [:app, :client_id, :hashed_secret, :secret_last_eight, :url, :callback_url] => [:environment, "db:create_org"] do |_t, args|
      if GitHub.enterprise?
        OauthApplication.register_hashed_trusted_application(args[:app], args[:client_id], args[:hashed_secret], args[:secret_last_eight], args[:url], args[:callback_url])
      end
    end

    task :add_required_apps => [:environment, "db:create_org"] do |_t, _args|
      OauthApplication.register_trusted_application("GitHub Gist", GitHub.gist_oauth_client_id, GitHub.gist_oauth_secret_key, "https://#{GitHub.gist3_host_name}", "https://#{GitHub.gist3_host_name}/auth/github/callback")
      OauthApplication.register_trusted_application(GitHub.pages_github_app_name, nil, nil, "https://#{GitHub.pages_host_name_v2}", "https://#{GitHub.pages_host_name_v2}/callback")
      OauthApplication.register_trusted_application("GitHub Hookshot", ENV["ENTERPRISE_HOOKSHOT_OAUTH_CLIENT_ID"], ENV["ENTERPRISE_HOOKSHOT_OAUTH_SECRET"], "https://#{GitHub.host_name}/hookshot", "https://#{GitHub.host_name}/hookshot/callback")
      OauthApplication.register_hashed_trusted_application("GitHub for Mac", "eac522c6b68c504b2aac", "MaLMjIcyD8PddzTMWFQxu0lQbrJYToVFMku8yAK3dxw=", "8243281a", "https://mac.github.com/", "github-mac://oauth")
      OauthApplication.register_hashed_trusted_application("GitHub for Windows", "fd5f729d309a7bfa8e1b", "Bt6+6v8xUPHCpeGUo1C2HqCoDebmLjPOIhkB1XweM/0=", "f850b6bd", "https://windows.github.com/")
      OauthApplication.register_hashed_trusted_application("GitHub Extension for Visual Studio", "a200baed193bb2088a6e", "CMkcMsAwdKkw26eosp7XDNJ3cPxbYTIbEujlY/9WrUQ=", "f5d228c9", "https://visualstudio.github.com/", "http://localhost:42549")
      OauthApplication.register_hashed_trusted_application("Atom", "395e9bb22e83bd612319", "BsrpVizUJxWmZkA9s99s7sW384CgCSCDTbJXtRVYRvI=", "29aed2bb", "https://atom.io/", "atom://x-oauth")
      OauthApplication.register_hashed_trusted_application("GitHub Desktop", "de0e3c7e9973e1c4dd77", "qzIk6WiFyEZJ5T6ulIpg3FcKkTzsKqL70dnMpgR0L1I=", "d961e2a3", "https://desktop.github.com/", "x-github-desktop-auth://oauth")
      OauthApplication.register_hashed_trusted_application("GitHub CLI", "178c6fc778ccc68e1d6a", "0bMZDaz7avFHm+0oZkVcCy3u4RkQTdcLCf+KmR1zNVw=", "ede1cc0b", "https://github.com/github/gh-cli", "http://localhost")
      OauthApplication.register_hashed_trusted_application("Hub CLI", "20a7719cd6246bdf8b48", "zTl/7UYqoouk53G90MPEVbNDQzQEGP14XHq/Pyz9qeM=", "8af04d78", "https://hub.github.com/", "http://localhost")
      OauthApplication.register_hashed_trusted_application("GitHub for Unity", "107b906ff287f62a12a4", "IEPWz9hMtK76m5AieNsnT2OsZo4F5NUbivE4nzAJ8Ps=", "197d2137", "https://unity.github.com/", "http://localhost:42424/callback")
      OauthApplication.register_hashed_trusted_application("GitHub for VSCode", "01ab8ac9400c4e429b23", "+UlnISR77yqymFUi3MoYLKyvJWrq7y9mDVUjKBPLd0I=", "76b86099", "https://vscode.github.com", "https://vscode.dev/redirect")
      OauthApplication.register_hashed_trusted_application("GitHub iOS", "2cfa9b7a1b57de32dd0d", "+8y9nQ+YgPIXwOpO9t7FU2bcBKVRRScrikY+sWhHjGg=", "637f332c", "https://github.com", "github://com.github.ios")
      OauthApplication.register_hashed_trusted_application("GitHub Android", "3f8b8834a91f0caad392", "ZJj5OINqR3yg2V2p1WlrMWUNiKxF9Ixthz0/63vTOWk=", "fcdc0165", "https://github.com", "github://com.github.android/oauth")
    end

    # The GitHub Extension for Visual Studio requires multiple callback URLs for backwards compatibility.
    #
    # Due to how callback_urls are stored (serialized alongside with scope in raw_data) we can't just add the new
    # callback URLs to the application_callback_urls table from the migrations bash script in enterprise2[1], we need
    # to do it from within the ruby environment.
    #
    # 1. https://github.com/github/enterprise2/blob/b00488544316f1ab29f86582521c357e0741a165/vm_files/usr/local/share/enterprise/ghe-run-migrations#L860
    task :set_ghfvs_callback_urls => [:environment] do |_t, _args|
      return unless GitHub.enterprise?

      ghfvs = OauthApplication.find_by(key: Apps::Internal::Codespaces::VISUAL_STUDIO_KEY)
      if ghfvs.nil?
        fail "Could not find GitHub Extension for Visual Studio Oauth app"
      end

      ghfvs.set_application_callback_urls(
        "http://localhost:42549",
        "http://localhost/",
        "vsweb+githubsi://authcode/"
      )
      ghfvs.save!
    end
  end
end

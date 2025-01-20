# frozen_string_literal: true

require Rails.root.join("script/seeds/objects")

namespace :users do

  desc "Creates a single user on dotcom"
  task :create , [:login, :password] => [:environment] do |_t, args|
    login = args[:login]
    email = "#{login}@test.githubapp.com"

    if User.find_by_login(login)
      puts "    exists: %s" % [login]
      if args[:password]
        user = User.find_by_login(login)
        user.update!(password: args[:password])
      end
    else
      password = args[:password] || SecureRandom.hex(14) + "@@"

      user =
        User.create!(
          login: login,
          email: email.sub(/@/, "+#{login}@"),
          password: password,
          password_confirmation: password,
          require_email_verification: false,
          spammy_reason: "Not spammy",
        )
      puts "  creating: %s <%s>" % [user.login, user.email]
      user.emails.map(&:verify!)
      user.save!
    end

  end
end

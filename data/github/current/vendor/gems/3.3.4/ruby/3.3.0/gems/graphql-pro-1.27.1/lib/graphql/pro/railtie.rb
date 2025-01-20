# frozen_string_literal: true
module GraphQL
  module Pro
    class Railtie < Rails::Railtie
      initializer "graphql_pro.add_reloader" do |app|
        app.reloaders << GraphQL::Pro::Repository::Reloader
      end
      config.to_prepare do
        GraphQL::Pro::Repository::Reloader.execute
      end
    end
  end
end

# frozen_string_literal: true

module GitHubTrilogyAdapter
  module Driver
    extend ActiveSupport::Concern

    class_methods do
      def database_driver=(database_driver = ::Trilogy)
        @database_driver = database_driver
      end

      def database_driver
        @database_driver ||= ::Trilogy
      end

      # Mostly the same as upstream, but with a configurable database driver (so
      # we can use Resilient::Trilogy).
      def new_client(config)
        config[:ssl_mode] = parse_ssl_mode(config[:ssl_mode]) if config[:ssl_mode]
        database_driver.new(config)
      rescue ::Trilogy::Error => error
        raise translate_connect_error(config, error)
      end
    end
  end
end

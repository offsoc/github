# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

# typed: strict
module Seeds
  class Runner
    class OgImageApp < Seeds::Runner
      extend T::Sig

      sig { returns(String) }
      def self.help
        <<~HELP
        Creates an app for the open graph image server integration, along with a new private key.
        Writes out APP_ID and PRIVATE_KEY for copying into the local .env of custom-og-image.
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {})
        Seeds::Objects::Integration.create_og_image_integration
      end
    end
  end
end

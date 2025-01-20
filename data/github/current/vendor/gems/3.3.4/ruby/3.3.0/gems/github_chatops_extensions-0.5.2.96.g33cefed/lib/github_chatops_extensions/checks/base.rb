# frozen_string_literal: true

module GitHubChatopsExtensions
  module Checks
    class Base
      def initialize(params, banner, logger = Logger.new(STDERR))
        @params = params
        @banner = banner
        @logger = logger
      end

      private

      attr_reader :banner, :params, :logger

      def room_id
        params.fetch(:room_id)
      end

      def user
        params.fetch(:user)
      end
    end
  end
end

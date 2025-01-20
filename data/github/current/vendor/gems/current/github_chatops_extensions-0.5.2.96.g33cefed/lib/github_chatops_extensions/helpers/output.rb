# frozen_string_literal: true

module GitHubChatopsExtensions
  class Helpers
    class Output
      class ExitError < StandardError; end

      COLORS = {
        error: "ff0000",
        info: "a0a0a0",
        success: "0000ff"
      }.freeze

      def initialize
        @color = colors.fetch(:info)
        @messages = []
      end

      def preformatted(message)
        messages << ["```", message, "```"].join("\n")
      end

      def info(message)
        @color = colors.fetch(:info)
        messages << message
      end

      def error(message)
        @color = colors.fetch(:error)
        messages << message
      end

      def success(message)
        @color = colors.fetch(:success)
        messages << message
      end

      def exit(_code = 255)
        # :nocov:
        raise GitHubChatopsExtensions::ExitError
        # :nocov:
      end

      def as_json
        { result: messages.join("\n"), color: }
      end

      private

      attr_reader :color
      attr_reader :messages

      def colors
        COLORS
      end
    end
  end
end

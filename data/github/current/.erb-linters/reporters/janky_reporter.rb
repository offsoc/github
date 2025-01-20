# typed: true
# frozen_string_literal: true

require "erb_lint/reporters/compact_reporter"

module ERBLint
  module Reporters
    class JankyReporter < CompactReporter
      CWD_PREFIX = "#{Dir.pwd}/"

      private

      # see: https://github.com/github/ci/blob/master/docs/json-test-output.md
      def format_offense(filename, offense)
        # map erblint severity to janky failure vs warning. see this for erblint severity levels:
        # https://github.com/Shopify/erb-lint/blob/main/lib/erb_lint/utils/severity_levels.rb
        if [:info, :warning].include? offense.severity
          format_warning(filename, offense)
        else
          format_error(filename, offense)
        end
      end

      def generate_fingerprint(data, key = "THE CAKE IS A LIE")
        OpenSSL::HMAC.hexdigest("SHA256", key, data.to_json)[0..31]
      end

      # https://github.com/github/github/issues/206064#issuecomment-1018434669
      def summary
        if stats.corrected > 0
          report_corrected_offenses
        elsif stats.ignored > 0 || stats.found > 0
          if stats.ignored > 0
            puts Rainbow("#{stats.ignored} error(s) were ignored in ERB files").yellow
          end
          if stats.found > 0
            puts Rainbow("#{stats.found} error(s) were found in ERB files").red
          end
        else
          puts "No errors were found in ERB files"
        end
      end

      def format_error(filename, offense)
        message = offense.message
        klass = offense.linter.class
        klass_name = klass.name.split("::")[-1]
        filename = filename.sub(CWD_PREFIX, "")

        if klass.name.match?(/Accessibility|A11y/)
          message += "\nReach out to @github/accessibility or slack #accessibility for help.\n"
        end

        data = {
          suite: "erblint",
          name: klass_name,
          message: message,
          location: "#{filename}:#{offense.line_number}",
          fingerprint: generate_fingerprint(data)
        }

        # see https://github.com/github/ci/blob/main/docs/build_actions.md
        "===FAILURE===\n#{JSON.pretty_generate(data)}\n===END FAILURE==="
      end

      def format_warning(filename, offense)
        message = offense.message
        klass = offense.linter.class
        klass_name = klass.name.split("::")[-1]
        filename = filename.sub(CWD_PREFIX, "")

        if klass.name.match?(/Accessibility|A11y/)
          message += "\nReach out to @github/accessibility or slack #accessibility for help.\n"
        end

        data = {
          "annotation_level": "warning",
          "message": message,
          "path": filename,
          "start_line": offense.line_number,
          "end_line": offense.line_number,
          "title": klass_name
        }

        # see https://github.com/github/ci/blob/main/docs/build_actions.md
        "===CHECK RUN ANNOTATION===\n#{JSON.pretty_generate(data)}\n===END CHECK RUN ANNOTATION==="
      end

    end
  end
end

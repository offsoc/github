# frozen_string_literal: true

require "json"

module GitHubChatopsExtensions
  module Command
    ##
    # Abstraction and utility methods around parsing arguments from ARGV
    #
    # This can take a specification from the command itself to help parse options in such
    # a way as to be useful, without writing a bunch of custom parsing logic. The specification
    # will look like this:
    #
    # {
    #   variables: {
    #     "verbose"  => { argument: false, default: false, required: false },
    #     "username" => { argument: true, required: true }
    #   },
    #   aliases: {
    #     "v" => "verbose",
    #     "u" => "username"
    #   },
    #   placeholders: %w[username]
    # }
    #
    # Here are some examples of how this specification would parse into keys and values:
    #   `username=foo -v`              => { username: "foo", verbose: true }
    #   `username=foo`                 => { username: "foo", verbose: false }
    #   `--verbose -u foo`             => { username: "foo", verbose: true }
    #   `--no-verbose --username=foo`  => { username: "foo", verbose: false }
    #   `--verbose foo`                => { username: "foo", verbose: true } (because first placeholder argument is username)
    #   `foo`                          => { username: "foo", verbose: false } (because first placeholder argument is username)
    #   `--verbose`                    => Raises an error because username is not defined, but it's required per spec
    #   `--chickens --username foo`    => Raises an error because chickens is not known as an argument
    #
    class Arguments
      attr_reader :raw, :kv, :plain

      def initialize(argv:, params:, spec: {})
        unless argv.is_a?(Array)
          raise ArgumentError, "ChatOps arguments must be an array, got #{argv.class}!"
        end

        unless params.is_a?(Hash)
          raise ArgumentError, "Params must be a Hash, got #{params.class}!"
        end

        unless spec.is_a?(Hash)
          raise ArgumentError, "Argument specification must be a Hash, got #{spec.class}!"
        end

        argv.select! { |arg| arg.is_a?(String) }

        # ChatOps RPC parses some arguments on its own. If it found and handled any of those, insert those back into
        # argv right after the command so we can parse them back out.
        if params[:params].is_a?(Hash)
          changes = false

          params[:params].each do |k, v|
            next if k == "command" || k == "raw_arguments"
            changes = true

            # `--foo=bar baz` parses to { "--foo=bar" => "baz" }
            # `--foo=bar` with no following arguments parses to { "--foo=bar" => true }
            if k =~ /\A(?:--)?([^=]+)=(.+)\z/
              argv << "--#{Regexp.last_match(1)}"
              argv << Regexp.last_match(2)
              argv.concat v.split(/\s+/)
              next
            end

            # `--foo bar` parses to { "foo" => "bar" } - good
            # `--foo bar baz` parses to { "foo" => "bar baz" } - bad
            argv << "--#{k.sub(/\A-+/, '')}"
            argv.concat v.split(/\s+/)
          end

          # If the line ends with `--foo bar` this hashes to { "foo=bar" => "true" }.
          # This could mess up if the actual value is "true" but short of just having the actual text that
          # was typed, this errs on the side of the most frequent use case.
          argv.pop if changes && argv.last == "true"
        end

        @raw = argv.dup
        @kv = {}
        @plain = []

        initialize_spec!(argv, spec)

        while argv.any?
          arg = argv.shift

          if arg =~ /\A--no-([^\s=\-][^\s=]*?)\s*\z/
            # Negated argument, like --no-something. Treat this as something=false.
            matched_var = Regexp.last_match(1)
            var = validate_variable!(matched_var)
            @kv[var.to_sym] = false
          elsif arg =~ /\A--?([^\s=\-][^\s=]*?)\s*\z/
            # Boolean argument or just a flag, like --something or -m. This can either be a standalone
            # flag or it can be a boolean.
            matched_var = Regexp.last_match(1)
            var = validate_variable!(matched_var)

            # Do we know that this variable does, or does not, expect an argument?
            if @spec[:variables][var]
              arg = @spec[:variables][var][:argument]
              if arg == false
                # It's a boolean flag, and it's given, so set it to true and be done.
                @kv[var.to_sym] = true
                next
              end

              if arg == true
                # It explicitly requires an argument. Grab the next value.
                next_arg = argv.shift

                # handle quoted multi-word args
                mw_arg = get_multi_word_arg(next_arg, argv)
                full_arg = mw_arg
                if mw_arg.is_a?(Array)
                  full_arg = assemble_multi_word_arg(next_arg, mw_arg)
                  argv.shift(mw_arg.count)
                end
                @kv[var.to_sym] = full_arg
                next if @kv[var.to_sym]
                raise GitHubChatopsExtensions::CommandError, "Parameter `#{matched_var}` expects an argument but none was provided."
              end
            end

            # We don't know what to do from the specification, so guess. If there are no more variables or the next item
            # starts with a dash, treat this as a boolean flag. Otherwise grab the next item from the command line.
            if argv.empty? || argv.first.start_with?("-")
              @kv[var.to_sym] = true
            else
              @kv[var.to_sym] = argv.shift
            end
          elsif arg =~ /\A(?:--)?([^\s=\-][^\s=]*?)=(.+?)\s*\z/
            # Handle all variations of something=value (with zero or two leading dashes).
            matched_var, val = Regexp.last_match(1), Regexp.last_match(2)
            var = validate_variable!(matched_var)

            # handle quoted multi-word args
            mw_arg = get_multi_word_arg(val, argv)
            full_arg = mw_arg
            if mw_arg.is_a?(Array)
              full_arg = assemble_multi_word_arg(val, mw_arg)
              argv.shift(mw_arg.count)
            end
            @kv[var.to_sym] = full_arg
          elsif arg.start_with?("-")
            raise GitHubChatopsExtensions::CommandError, "Invalid parameter `#{arg}`."
          else
            # Placeholder argument. If placeholder orders are given in the spec, assign that to the kv.
            # We're just going to trust that the spec wouldn't name a placeholder that doesn't exist in
            # the spec, so blindly create the key in @kv regardless.
            @plain << arg
            if @spec[:placeholders].any?
              placeholder = @spec[:placeholders].shift.to_sym

              # handle quoted multi-word args
              mw_arg = get_multi_word_arg(arg, argv)
              full_arg = mw_arg
              if mw_arg.is_a?(Array)
                full_arg = assemble_multi_word_arg(arg, mw_arg)
                argv.shift(mw_arg.count)
              end
              # Do not overwrite an existing KV with a placeholder value
              @kv[placeholder] ||= full_arg
            end
          end
        end

        enforce_spec!
      end

      # :nocov:
      def debug
        JSON.pretty_generate(command:, plain:, raw:, kv:)
      end
      # :nocov:

      # Allow retrieving of key-values like a hash
      def [](val)
        @kv[val.to_sym]
      end

      private

      def initialize_spec!(argv, spec)
        @spec = spec
        @spec[:variables] ||= {}
        @spec[:aliases] ||= {}
        @spec[:placeholders] ||= []

        # Pull all default values from the specification to populate @kv
        @spec[:variables].each do |var_name, data|
          next unless data.is_a?(Hash) && data.key?(:default)
          @kv[var_name.to_sym] = data[:default]
        end
      end

      def enforce_spec!
        @spec[:variables].each do |var_name, data|
          next unless data[:required]
          next if @kv.key?(var_name.to_sym)
          raise GitHubChatopsExtensions::CommandError, "Required argument `#{var_name}` was not provided."
        end
      end

      def validate_variable!(var)
        # If the spec is undefined, let it go.
        return var unless @spec[:variables].keys.any?

        # See if this is a real variable.
        return var if @spec[:variables].key?(var)

        # See if this is an alias, and if so, return whatever it's an alias to.
        return @spec[:aliases][var] if @spec[:aliases].key?(var)

        # What?
        raise GitHubChatopsExtensions::CommandError, "Unrecognized command line parameter: `#{var}`."
      end

      # look for quoted multi-word argument or return single-word arg
      def get_multi_word_arg(arg, argv)
        if arg && arg =~ /^['|"]/
          matched_char = Regexp.last_match
          closing_index = argv.find_index { |e| e.match(/#{matched_char}$/) }
          if closing_index
            res = argv.shift(closing_index + 1)
          else
            raise GitHubChatopsExtensions::CommandError, "Missing matching `#{matched_char}` for argument starting `#{arg}`. Don't quote a single-word value."
          end
        else
          res = arg
        end
        return res
      end

      # assemble a multi-word argument from the parts
      def assemble_multi_word_arg(arg, args)
        res  = arg.gsub(/^['|"]/, "") + " "
        res += args.shift(args.count).join(" ").gsub(/['|"]$/, "")
      end
    end
  end
end

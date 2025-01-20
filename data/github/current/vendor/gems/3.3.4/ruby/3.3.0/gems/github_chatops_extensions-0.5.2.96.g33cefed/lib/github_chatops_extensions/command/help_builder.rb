# frozen_string_literal: true

module GitHubChatopsExtensions
  module Command
    class HelpBuilder < BaseCommand
      def execute
        unless params[:handler_args][:namespace]
          message = "Please ask the author of this ChatOp to properly pass handler_args/namespace to HelpBuilder!"
          raise GitHubChatopsExtensions::Errors::MissingArgumentError, message
        end

        # If user asked for help with a specific class then display the header message for that class.
        # This makes `.foo help baz` display the header message of <Namespace>::Foo::Baz.
        args_plain = args.plain
        if args_plain.size == 2 && args_plain.first.downcase == "help"
          requested_subcommand = args_plain[1]
          help_text = help_from_class(requested_subcommand, :help)
          if help_text
            response.info help_text
          elsif help_text == false
            if hfc = help_from_class(requested_subcommand, :header)
              response.info "`.#{command} #{requested_subcommand}` - #{hfc}"
            else
              response.error "Sorry @#{user}, but there's no additional help available for `.#{command} #{requested_subcommand}`."
            end
          elsif requested_subcommand =~ /\A\w+\z/
            response.error "Sorry @#{user}, but I don't know about `.#{command} #{requested_subcommand}`."
          else
            response.error "Sorry @#{user}, but I can't look up help for that."
          end
          return
        end

        if args_plain.size == 1 && args_plain.first.downcase == "help"
          response.info base_help
          return
        end

        response.error "Sorry @#{user}, but I don't know what you mean."
      end

      private

      # Generate the base help. Iterate through all classes in the command namespace.
      # If :base_help returns something then return it. If that isn't found anywhere, return
      # a list of all commands for which help was defined.
      def base_help
        commands = []
        help = []
        classes_in_namespace.sort_by { |clazz| clazz.to_s.downcase }.each do |clazz|
          if clazz_base_help = clazz.base_help
            return clazz_base_help
          end

          next unless clazz.registerable?

          if clazz.header
            help << "`.#{command} #{clazz.subcommand}` - #{clazz.header}"
          end

          commands << clazz.subcommand
        end

        if help.any?
          help.unshift "Auto-generated help for `.#{command}`:"
          return help.join("\n")
        end

        methods = commands.map { |command| "`#{command}`" }.join(", ")
        "No help for `.#{command}` - commands include: #{methods}"
      end

      # Get a list of all classes in the parent namespace.
      def classes_in_namespace
        ObjectSpace.each_object(GitHubChatopsExtensions::Command::BaseCommand.singleton_class)
          .select { |obj| obj.to_s.start_with?("#{params[:handler_args][:namespace]}::") }
      end

      # Return codes:
      # nil    - Class not found
      # false  - Class found but it does not have help information
      # String - The help text
      def help_from_class(class_name, method_name)
        return unless clazz = find_class_in_namespace(class_name)
        clazz.send(method_name) || false
      end

      # Take case-insensitive class name and find the match if it exists in the namespace.
      # This matches on the command name if defined, otherwise on the class name.
      def find_class_in_namespace(text)
        classes_in_namespace.detect { |clazz| clazz.subcommand.downcase == text.downcase }
      end

      def user
        params["user"]
      end
    end
  end
end

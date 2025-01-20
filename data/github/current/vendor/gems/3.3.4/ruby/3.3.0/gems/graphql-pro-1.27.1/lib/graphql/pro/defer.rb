# frozen_string_literal: true
require "forwardable"

module GraphQL
  module Pro
    class Defer < Schema::Directive
      description "Directs the executor to deliver this part of the result after the initial result."

      locations(
        GraphQL::Schema::Directive::FIELD,
        GraphQL::Schema::Directive::FRAGMENT_SPREAD,
        GraphQL::Schema::Directive::INLINE_FRAGMENT
      )

      argument :if, Boolean, required: false,
        default_value: true,
        description: "If false, this field _won't_ be deferred."

      argument :label, String, required: false,
        description: "A unique label to identify the deferred payload."

      def self.resolve(object, arguments, context, &block)
        if arguments[:if]
          defer = context[:defer] ||= self::Deferred.new(context)
          path = context[:current_path]
          defer.deferrals << self::Deferral.new(block: block, path: path, context: context, label: arguments[:label])
        else
          yield
        end
      end

      def self.use(schema)
        if schema.is_a?(Class)
          schema.directive(self)
        else
          [schema, schema.target].each do |schema_defn|
            schema_defn.directive(self.graphql_definition)
          end
        end
      end

      # A state manager for defered data
      class Deferred
        extend Forwardable
        # @return [Array<Deferral>]
        attr_reader :deferrals

        def initialize(context)
          @context = context
          root_deferral = RootDeferral.new(query: context.query)
          @deferrals = [root_deferral]
        end

        # Shortcuts for handling each patch
        def_delegators :deferrals, :each, :map

        # Write an Apollo Client-compatibile stream to a Rails `response`.
        # @see Deferred#to_http_multipart for options
        # @param incremental [Boolean] If true, use the newer "incremental" patch format
        def stream_http_multipart(response, incremental: false, delimiter: "-", pretty: false)
          response.headers["Content-Type"] = "multipart/mixed; boundary=\"#{delimiter}\""
          deferrals.each_with_index do |deferral, idx|
            patch_str = deferral.to_http_multipart(pretty: pretty, first: idx == 0, delimiter: delimiter, incremental: (incremental && idx != 0))
            response.stream.write(patch_str)
          end
        end
      end

      class Deferral
        # @return [Array<String, Integer>] The path to this deferred part of the query
        attr_reader :path
        # @return [String, nil] A unique label to identify the deferred payload
        attr_reader :label

        def initialize(path:, block:, context:, label:)
          # This path was a new object created by the runtime,
          # so it doesn't need duping.
          @path = path
          @block = block
          @context = context
          @label = label
          @data = nil
          @errors = nil
          @was_resolved = false
        end

        # If success, the final GraphQL value of this deferred part
        def data
          resolve
          @data
        end

        # If there were any errors, an array of errors. Otherwise, `nil`.
        def errors
          resolve
          @errors
        end

        # @return [Hash] with `path:`, either `errors:` or `data:`, and `label:`, if given.
        def to_h
          # Run this now so that `hasNext` will be up-to-date
          resolve

          h = {
            path: path,
            hasNext: has_next?
          }

          if label
            h[:label] = label
          end

          if errors
            h[:errors] = errors
          else
            h[:data] = data
          end

          h
        end

        # @return [Hash] A hash with a root `incremental:` key for the new RFC
        def to_incremental_h
          payload = {
            path: path,
          }
          if label
            payload[:label] = label
          end

          if errors
            payload[:errors] = errors
          else
            payload[:data] = data
          end

          {
            incremental: [payload],
            hasNext: has_next?
          }
        end

        def has_next?
          deferrals = @context[:defer].deferrals
          deferrals.last != self
        end

        # Create a response chunk compliant with
        # https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html.
        #
        # Meant to support Apollo Client:
        # https://www.apollographql.com/docs/react/features/defer-support.html
        #
        # It appends a final terminator if {#has_next?} is false.
        #
        # @param delimiter [String] preceeds the patch to segment the response
        # @param pretty [Boolean] if true, pretty-print the JSON for debugging
        # @return [String]
        def to_http_multipart(delimiter: "-", pretty: false, first: false, incremental: false)
          data_h = incremental ? to_incremental_h : to_h
          patch = pretty ? JSON.pretty_generate(data_h) : JSON.dump(data_h)
          "#{first ? "\r\n--#{delimiter}" : ""}\r\nContent-Type: application/json\r\nContent-Length: #{patch.bytesize}\r\n\r\n#{patch}\r\n--#{delimiter}#{!has_next? ? "--" : ""}"
        end

        private

        def resolve
          if !@was_resolved
            @was_resolved = true
            prev_error_count = @context.errors.size
            dl = @context.respond_to?(:dataloader) && @context.dataloader
            deferred_result = nil
            call_and_resolve_lazies = ->{
              deferred_result = @block.call
              # It might have returned a lazy value, sync it.
              deferred_result = @context.schema.sync_lazy(deferred_result)
              # It might have returned an Array or Hash with nested lazies, sync them
              resolve_lazies([deferred_result])
            }
            if dl && dl.respond_to?(:run_isolated)
              dl.run_isolated(&call_and_resolve_lazies)
            else
              call_and_resolve_lazies.call
            end
            # Some GraphQL-Ruby versions use response objects that need to be unwrapped
            if deferred_result.respond_to?(:graphql_result_data)
              deferred_result = deferred_result.graphql_result_data
            end
            # Dup the value because, if it has nested patches,
            # they'll be added later to the same hash.
            @data = isolate_copy(deferred_result)
            new_error_count = @context.errors.size
            # Diff the errors against the previous errors; if there are more,
            # they happened during `.call` above.
            if new_error_count > prev_error_count
              own_errors = @context.errors.last(new_error_count - prev_error_count)
              own_errors.each { |e| e.respond_to?(:path=) && e.path.nil? && e.path = @path}
              @errors = own_errors.map(&:to_h)
            end
          end
        end

        case Execution::Interpreter::Resolve.method(:resolve_all).arity
        when 1
          # pre-dataloader, < 1.12
          def resolve_lazies(lazies)
            Execution::Interpreter::Resolve.resolve_all(lazies)
          end
        when 2
          # post-dataloader, 1.12+
          def resolve_lazies(lazies)
            Execution::Interpreter::Resolve.resolve_all(lazies, @context.dataloader)
          end
        else
          raise "Unexpected Resolve.resolve_all arity: #{Execution::Interpreter::Resolve.method(:resolve_all).arity}"
        end

        # The result hash is mutable and will be mutated while the query runs.
        # Dup any GraphQL result that you don't want to be modified later.
        def isolate_copy(value)
          if value.is_a?(Hash)
            # Copy hashes because the runtime will be adding to the original hash in-place
            new_value = {}
            value.each do |k, v|
              new_value[k] = isolate_copy(v)
            end
            new_value
          elsif value.is_a?(Array)
            # Even though this array won't be modified
            # make sure nested hashes are copied
            value.map { |v| isolate_copy(v) }
          else
            # Assume it's a scalar value which won't be changed
            value
          end
        end
      end

      # Acts like a deferral, but represents the root level response.
      # Make sure to `isolate_copy` data and errors, because they'll
      # continue receiving updates as patches are resolved.
      class RootDeferral < Deferral
        def initialize(query:)
          @query = query
          @context = query.context
        end

        def data
          @data ||= isolate_copy(@query.result["data"])
        end

        def errors
          @errors ||= isolate_copy(@query.result["errors"])
        end

        def to_h
          h = {
            hasNext: has_next?
          }
          if (d = data)
            h[:data] = d
          end

          if (e = errors) && e.any?
            h[:errors] = e
          end
          h
        end
      end
    end
  end
end

# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Resources
      module Decorators
        class Decorator
          def order
            self.class::ORDER
          end
        end

        class DecoratorError < StandardError; end

        class RunWhenConfig < Decorator
          ORDER = 4
          attr_reader :apply, :filter, :matcher, :to

          def initialize(filter, matcher, to: nil)
            unless [:changes, :set].include?(matcher)
              raise ArgumentError, "the matcher parameter must be either :changes or :set"
            end
            if matcher == :set && to.nil?
              raise ArgumentError, "when using the :set matcher the to: named parameter must be provided"
            end

            @filter = filter
            @matcher = matcher
            @to = to
          end

          def decorate(context)
            if (filter =~ /[\*\?]/) && (config_changes_to? || config_set_to?)
              raise ArgumentError, "scope cannot use a wildcard"
            end

            if Hash(Thread.current[:disable_decorators]).key?(self.class)
              return yield
            end

            @apply = context[:apply]
            run = case
              when config_changes?
                !config_diff.empty?
              when config_changes_to?
                context[:run_when_config_to] = true
                handle_force(context)
                if config_diff.empty?
                  false
                else
                  config_diff.dig(filter).dig(1) == to
                end
              when config_set_to?
                context[:run_when_config_to] = true
                raw_config.dig(*filter.split(".")).to_s == to
              end

            Decorators.set_run(context, run)
            yield
          end

          def config_diff
            apply.config_diff(filter)
          end

          def raw_config
            GheConfig.new.load_config
          end

          def config_changes?
            matcher == :changes && to.nil?
          end

          def config_changes_to?
            matcher == :changes && !to.nil?
          end

          def config_set_to?
            matcher == :set && !to.nil?
          end

          def handle_force(context)
            if context.dig(:force)
              # if the force flag is set, this method would otherwise run
              # however, for :changes, to: methods we must also check that the current config value equals the to: parameter
              # eg. "enabled = true"
              # if it doesn't match, we undo the force
              if raw_config.dig(*filter.split(".")).to_s != to
                context.merge!(force: false)
              end
            end
          end
        end

        class RunOnUpgrade < Decorator
          ORDER = 3
          attr_reader :filter, :matcher, :to

          def initialize(filter = nil, matcher = nil, to: nil)
            if filter
              if matcher.nil? || to.nil?
                raise ArgumentError, "when using the filter, the :set matcher and the to: named parameter must be provided"
              end
              if matcher != :set
                raise ArgumentError, "the matcher parameter must be :set"
              end
            end

            @filter = filter
            @matcher = matcher
            @to = to
          end

          def decorate(context)
            if Hash(Thread.current[:disable_decorators]).key?(self.class)
              return yield
            end

            run = true
            if filter
              run = raw_config.dig(*filter.split(".")).to_s == to
              # remove force flag if filter doesn't match
              context.merge!(force: false) unless run
            else
              # run_on_upgrade must be called with parameters when combined with
              # run_when_config :changes, to: or run_when_config :set, to:
              raise DecoratorError.new("run_on_upgrade must be called with filter, :set, to: parameters") if context[:run_when_config_to]
            end

            Decorators.set_run(context, run && upgrade?)
            yield
          end

          private

          def upgrade?
            File.exist?(upgrade_file)
          end

          def raw_config
            GheConfig.new.load_config
          end

          def upgrade_file
            ENV.fetch("GHE_UPGRADE_FILE", "/data/user/common/ghe-upgrade-occurred")
          end
        end

        class RunOnClusterFailover < Decorator
          ORDER = 5
          attr_reader :apply

          def decorate(context)
            if Hash(Thread.current[:disable_decorators]).key?(self.class)
              return yield
            end

            @apply = context[:apply]

            # do not run on force
            context.merge!(force: false)

            Decorators.set_run(context, cluster_failover?)
            yield
          end

          private

          def cluster_failover?
            File.exist?(apply.cluster_failover_file)
          end
        end

        class Exec < Decorator
          ORDER = 1
          def decorate(context)
            if Hash(Thread.current[:disable_decorators]).key?(self.class)
              return yield
            end

            yield if Decorators.run?(context)
          end
        end

        class Instrument < Decorator
          ORDER = 2
          attr_reader :name

          def initialize(name)
            @name = name
          end

          def decorate(context)
            if Hash(Thread.current[:disable_decorators]).key?(self.class)
              return yield
            end

            apply = context[:apply]

            attributes = {
              "description" => "#{name}",
              "skipped" => false,
            }
            unless Decorators.run?(context)
              apply.logger.info("Skipping #{name}")
              attributes["skipped"] = true
            end

            apply.trace_event(attributes["description"], attributes) do |span|
              yield
            end
          end
        end

        # Determines if the method this macro is applied to should run, based on the given configuration string and options.
        #
        # filter: filtering in the dot separated format, eg. "app.packages.enabled"
        # matcher: one of :changes, or :set symbols
        # The :changes matcher may be combined with the to: named parameter
        # The :set matcher must be combined with the to: named parameter
        def run_when_config(filter, matcher, to: nil)
          decorator = RunWhenConfig.new(filter, matcher, to: to)
          add_decorator(decorator)
        end

        def run_on_upgrade(filter = nil, matcher = nil, to: nil)
          decorator = RunOnUpgrade.new(filter, matcher, to: to)
          add_decorator(decorator)
        end

        def run_on_cluster_failover
          decorator = RunOnClusterFailover.new
          add_decorator(decorator)
        end

        def instrument(name)
          decorator = Instrument.new(name)
          add_decorator(decorator)
        end

        private

        def add_decorator(decorator)
          (@_decorators ||= []) << decorator
        end

        def redefined_methods
          @_redefined_methods ||= {}
        end

        def method_added(method_name)
          return if @_decorators.nil? || @_decorators.empty?
          return if redefined_methods[method_name]
          redefined_methods[method_name] = true

          context ||= {}

          @_decorators.unshift(Exec.new).sort_by!(&:order)
          @_decorators.each do |decorator|
            orig_method = instance_method(method_name)
            define_method(method_name) do |*args, **kwargs, &block|
              if context[:apply].nil?
                if self.respond_to?(:apply)
                  context[:apply] = self.apply
                else
                  context[:apply] = self
                end
              end

              if !ENV.fetch("GHE_CONFIG_APPLY_FORCE", "").empty? && !context.key?(:force)
                context[:force] = true
              end

              decorator.decorate(context) do
                bound_method = orig_method.bind(self)

                if args.empty? && kwargs.empty?
                  bound_method.call(&block)
                elsif args.empty?
                  bound_method.call(**kwargs, &block)
                elsif kwargs.empty?
                  bound_method.call(*args, &block)
                else
                  bound_method.call(*args, **kwargs, &block)
                end
              end
            end
          end

          # Reset the stack for the next method
          @_decorators = []
        end

        class << self
          def run?(context)
            return true if context.dig(:force)
            context.dig(:run) || context.dig(:run).nil?
          end

          def set_run(context, run)
            if run
              context.merge!(run: true)
            elsif context[:run].nil?
              context.merge!(run: false)
            end
          end
        end
      end
    end
  end
end

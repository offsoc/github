# typed: strict
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class FeatureFlag
      extend T::Sig

      require_relative Rails.root.join("script/vexi_setup")

      @@vexi_adapter = T.let(nil, T.nilable(Vexi::Adapters::FileAdapter))
      @@vexi_enabled = T.let(false, T::Boolean)

      sig { params(action: T.any(Symbol, String), feature_flag: T.any(String, Symbol), actor_name: T.nilable(String), diagnostic_io:  T.any(StringIO, IO)).returns(FlipperFeature) }
      def self.toggle(action:, feature_flag:, actor_name: nil, diagnostic_io: $stdout)
        feature = ensure_feature_flag_exists(feature_flag, diagnostic_io)
        if actor_name.nil?
          if vexi_enabled
            begin
              if action.to_s == "enable"
                vexi_adapter.enable(feature_flag)
              elsif action.to_s == "disable"
                vexi_adapter.disable(feature_flag)
              end
            rescue => exception # rubocop:disable Lint/GenericRescue
              diagnostic_io.puts "Could not #{action} feature flag '#{feature_flag}' in vexi: #{exception.message}"
            end
          end

          GitHub.flipper[feature_flag].method(action).call
          diagnostic_io.puts "#{feature_flag} globally #{action}d"
          return feature
        end

        actor = if actor_name.start_with?("business:")
          ::Business.find_by(slug: actor_name.gsub("business:", ""))
        else
          GitHub::Resources.find_by_url(actor_name, suppress_warning: true)
        end

        if actor.nil?
          raise Objects::ActionFailed, "Couldn't find the actor #{actor_name}"
        end

        if vexi_enabled
          begin
            vexy_actor_id = "#{actor.type}:#{actor.id}"
            if action.to_s == "enable"
              vexi_adapter.add_actor(feature_flag, vexy_actor_id)
            elsif action.to_s == "disable"
              vexi_adapter.remove_actor(feature_flag, vexy_actor_id)
            end
          rescue => exception # rubocop:enable Lint/GenericRescue
            diagnostic_io.puts "Failed to #{action} #{feature_flag} for actor #{actor_name} in Vexi: #{exception.message}"
          end
        end

        begin
          feature.method(action).call(actor)
          diagnostic_io.puts "#{feature_flag} #{action}d for #{actor_name}"
          feature
        rescue ::Flipper::GateNotFound
          raise Objects::ActionFailed, "Something went wrong when trying to #{action} #{feature_flag} for #{actor_name}"
        end
      end

      sig { params(feature_flag: T.any(String, Symbol), actor: T.nilable(T.all(Vexi::Actor, GitHub::IFlipperActor)), diagnostic_io:  T.any(StringIO, IO)).void }
      def self.enable(feature_flag:, actor: nil, diagnostic_io: $stdout)
        ensure_feature_flag_exists(feature_flag, diagnostic_io)
        if actor.nil?
          begin
            vexi_adapter.enable(feature_flag) if vexi_enabled
          rescue => exception # rubocop:disable Lint/GenericRescue
            diagnostic_io.puts "Could not enable feature flag '#{feature_flag}' in vexi: #{exception.message}"
          end
          GitHub.flipper[feature_flag].enable
        else
          begin
            vexi_adapter.add_actor(feature_flag, actor.vexi_id) if vexi_enabled
          rescue => exception # rubocop:disable Lint/GenericRescue
            diagnostic_io.puts "Could not disable feature flag '#{feature_flag}' for actor #{actor.vexi_id} in vexi: #{exception.message}"
          end

          GitHub.flipper.enable(feature_flag, actor)
        end
      end

      sig { params(feature_flag: T.any(String, Symbol), actor: T.nilable(T.all(Vexi::Actor, GitHub::IFlipperActor)), diagnostic_io:  T.any(StringIO, IO)).void }
      def self.disable(feature_flag:, actor: nil, diagnostic_io: $stdout)
        ensure_feature_flag_exists(feature_flag, diagnostic_io)

        if actor.nil?
          begin
            vexi_adapter.disable(feature_flag) if vexi_enabled
          rescue => exception # rubocop:disable Lint/GenericRescue
            diagnostic_io.puts "Could not disable feature flag '#{feature_flag}' in vexi: #{exception.message}"
          end

          GitHub.flipper[feature_flag].disable
        else
          begin
            vexi_adapter.remove_actor(feature_flag, actor.vexi_id) if vexi_enabled
          rescue => exception # rubocop:disable Lint/GenericRescue
            diagnostic_io.puts "Could not disable feature flag '#{feature_flag}' for actor #{actor.vexi_id} in vexi: #{exception.message}"
          end

          GitHub.flipper.disable(feature_flag, actor)
        end
      end

      sig { params(feature_flag: T.any(String, Symbol), diagnostic_io: T.any(StringIO, IO)).returns(FlipperFeature) }
      private_class_method def self.ensure_feature_flag_exists(feature_flag, diagnostic_io)
        if vexi_enabled
          begin
            vexi_adapter.create(Vexi::FeatureFlag.create_boolean_feature_flag(feature_flag.to_s, false)) if vexi_adapter.get_feature_flag(feature_flag).nil?
          rescue => exception # rubocop:disable Lint/GenericRescue
            diagnostic_io.puts "Could not create feature flag '#{feature_flag}' in vexi: #{exception.message}"
          end
        end

        feature = ::FlipperFeature.find_by(name: feature_flag)

        if feature.nil?
          diagnostic_io.puts "Creating #{feature_flag}"
          feature = ::FlipperFeature.create(name: feature_flag)
        end

        feature
      end

      sig { returns(Vexi::Adapters::FileAdapter) }
      private_class_method def self.vexi_adapter
        @@vexi_adapter ||= VexiSetup::Adapter.create
      end

      sig { returns(T::Boolean) }
      private_class_method def self.vexi_enabled
        @@vexi_enabled ||= VexiSetup::Adapter.enabled?
      end

    end
  end
end

# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers

    # `Tapioca::Compilers::ActiveModelValidatesConfirmation` decorates RBI files for all
    # classes that use [`ActiveModel::Validates::Confirmation`](https://api.rubyonrails.org/classes/ActiveModel/Validations/HelperMethods.html#method-i-validates_confirmation_of).
    #
    # For example, with the following class:
    #
    # ~~~rb
    # class User < ApplicationRecord
    #   validates_confirmation_of :password
    #
    #   validates :email, confirmation: true
    # end
    # ~~~
    #
    # this compiler will produce an RBI file with the following content:
    # ~~~rbi
    # # typed: true
    #
    # class User < ApplicationRecord
    #
    #   sig { returns(T.untyped) }
    #   def email_confirmation; end
    #
    #   sig { params(email_confirmation=: T.untyped).returns(T.untyped) }
    #   def email_confirmation=(email_confirmation); end
    #
    #   sig { returns(T.untyped) }
    #   def password_confirmation; end
    #
    #   sig { params(password_confirmation=: T.untyped).returns(T.untyped) }
    #   def password_confirmation=(password_confirmation); end
    # end
    # ~~~
    class ActiveModelValidatesConfirmation < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member do
        { fixed: T.all(T::Class[ActiveModel::Validations], ActiveModel::Validations::HelperMethods, ActiveModel::Validations::ClassMethods) }
      end

      sig { override.returns(T::Enumerable[Module]) }
      def self.gather_constants
        # Collect all the classes that include ActiveModel::Validations
        all_classes.select { |c| c < ActiveModel::Validations }
      end

      sig { override.void }
      def decorate
        confirmation_validators = constant.validators.select do |v|
          v.is_a?(ActiveModel::Validations::ConfirmationValidator)
        end

        return if confirmation_validators.empty?

        # Create a RBI definition for each class that includes Active::Model::Validations
        root.create_path(constant) do |klass|

          # Create RBI definitions for all the attributes that use confirmation validation
          confirmation_validators.each do |validator|
            validator.attributes.each do |attr_name|
              klass.create_method("#{attr_name}_confirmation", return_type: "T.untyped")
              klass.create_method("#{attr_name}_confirmation=", parameters: [
                create_param("#{attr_name}_confirmation", type: "T.untyped")
              ], return_type: "T.untyped")
            end
          end
        end
      end
    end
  end
end

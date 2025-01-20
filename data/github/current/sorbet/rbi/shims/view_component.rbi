# typed: strict

module ViewComponent
  module InlineTemplate
    module ClassMethods
      sig { params(template: String).void }
      def erb_template(template); end
    end
  end
end

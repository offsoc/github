# typed: strict

# ERB is shipped with Ruby, which means we don't generate RBI files and we
# instead get the ones included with Sorbet, which don't alway match the gem
# version that we're on. The following PR fixes this
# https://github.com/Shopify/tapioca/pull/1452
# Once we upgrade Tapioca to a version that includes the above PR, we can remove this file.
class ERB
  module Util

    # This is needed because upstream only has the module's singleton method. See
    # https://github.com/sorbet/sorbet/blob/9a24671d2778bf2d4a28c674c944906f59de0943/rbi/stdlib/erb.rbi#L933-L939
    sig { params(s: ::T.untyped).returns(::T.untyped) }
    def url_encode(s); end
  end
end

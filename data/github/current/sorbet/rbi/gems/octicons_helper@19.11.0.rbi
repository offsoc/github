# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `octicons_helper` gem.
# Please instead update this file by running `bin/tapioca gem octicons_helper`.

# source://octicons_helper//lib/octicons_helper/version.rb#3
module OcticonsHelper
  include ::ActionView::Helpers::CaptureHelper
  include ::ActionView::Helpers::OutputSafetyHelper
  include ::ActionView::Helpers::TagHelper

  # source://octicons_helper//lib/octicons_helper/helper.rb#11
  def octicon(symbol, options = T.unsafe(nil)); end

  # source://octicons_helper//lib/octicons_helper/helper.rb#9
  def octicons_helper_cache; end

  # source://octicons_helper//lib/octicons_helper/helper.rb#9
  def octicons_helper_cache=(val); end

  class << self
    # source://octicons_helper//lib/octicons_helper/helper.rb#9
    def octicons_helper_cache; end

    # source://octicons_helper//lib/octicons_helper/helper.rb#9
    def octicons_helper_cache=(val); end
  end
end

# source://octicons_helper//lib/octicons_helper/railtie.rb#6
class OcticonsHelper::Railtie < ::Rails::Railtie; end

# source://octicons_helper//lib/octicons_helper/version.rb#4
OcticonsHelper::VERSION = T.let(T.unsafe(nil), String)

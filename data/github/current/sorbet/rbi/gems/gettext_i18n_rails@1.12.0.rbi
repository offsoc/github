# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for types exported from the `gettext_i18n_rails` gem.
# Please instead update this file by running `bin/tapioca gem gettext_i18n_rails`.

# source://gettext_i18n_rails//lib/gettext_i18n_rails/action_controller.rb#4
class ActionController::Base < ::ActionController::Metal
  include ::ActionDispatch::Routing::PolymorphicRoutes
  include ::ActionController::Head
  include ::AbstractController::Caching::ConfigMethods
  include ::ActionController::BasicImplicitRender
  extend ::AbstractController::Helpers::Resolution

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#70
  def __callbacks; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#70
  def __callbacks?; end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/helpers.rb#13
  def _helper_methods; end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/helpers.rb#13
  def _helper_methods=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/helpers.rb#13
  def _helper_methods?; end

  # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#212
  def _layout_conditions; end

  # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#212
  def _layout_conditions?; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#924
  def _process_action_callbacks; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/renderers.rb#33
  def _renderers; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/renderers.rb#33
  def _renderers=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/renderers.rb#33
  def _renderers?; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#912
  def _run_process_action_callbacks(&block); end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching.rb#44
  def _view_cache_dependencies; end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching.rb#44
  def _view_cache_dependencies=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching.rb#44
  def _view_cache_dependencies?; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/params_wrapper.rb#185
  def _wrapper_options; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/params_wrapper.rb#185
  def _wrapper_options=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/params_wrapper.rb#185
  def _wrapper_options?; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/flash.rb#38
  def alert; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def allow_forgery_protection; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def allow_forgery_protection=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def asset_host; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def asset_host=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def assets_dir; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def assets_dir=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def csrf_token_storage_strategy; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def csrf_token_storage_strategy=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def default_asset_host_protocol; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def default_asset_host_protocol=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def default_static_extension; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def default_static_extension=(value); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_dispatch/routing/url_for.rb#100
  def default_url_options; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_dispatch/routing/url_for.rb#100
  def default_url_options=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_dispatch/routing/url_for.rb#100
  def default_url_options?; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def enable_fragment_cache_logging; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def enable_fragment_cache_logging=(value); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/etag_with_template_digest.rb#31
  def etag_with_template_digest; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/etag_with_template_digest.rb#31
  def etag_with_template_digest=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/etag_with_template_digest.rb#31
  def etag_with_template_digest?; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/conditional_get.rb#15
  def etaggers; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/conditional_get.rb#15
  def etaggers=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/conditional_get.rb#15
  def etaggers?; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/flash.rb#12
  def flash(*_arg0, **_arg1, &_arg2); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def forgery_protection_origin_check; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def forgery_protection_origin_check=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def forgery_protection_strategy; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def forgery_protection_strategy=(value); end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching/fragments.rb#26
  def fragment_cache_keys; end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching/fragments.rb#26
  def fragment_cache_keys=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching/fragments.rb#26
  def fragment_cache_keys?; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#70
  def helpers_path; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#70
  def helpers_path=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#70
  def helpers_path?; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#71
  def include_all_helpers; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#71
  def include_all_helpers=(_arg0); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#71
  def include_all_helpers?; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def javascripts_dir; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def javascripts_dir=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def log_warning_on_csrf_failure; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def log_warning_on_csrf_failure=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def logger; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def logger=(value); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/flash.rb#38
  def notice; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def per_form_csrf_tokens; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def per_form_csrf_tokens=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def perform_caching; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def perform_caching=(value); end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/callbacks.rb#36
  def raise_on_missing_callback_actions; end

  # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/callbacks.rb#36
  def raise_on_missing_callback_actions=(val); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/redirecting.rb#17
  def raise_on_open_redirects; end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/redirecting.rb#17
  def raise_on_open_redirects=(val); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def relative_url_root; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def relative_url_root=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def request_forgery_protection_token; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def request_forgery_protection_token=(value); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/rescuable.rb#15
  def rescue_handlers; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/rescuable.rb#15
  def rescue_handlers=(_arg0); end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/rescuable.rb#15
  def rescue_handlers?; end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/action_controller.rb#5
  def set_gettext_locale; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
  def stylesheets_dir; end

  # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
  def stylesheets_dir=(value); end

  private

  # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#328
  def _layout(lookup_context, formats); end

  # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/base.rb#290
  def _protected_ivars; end

  class << self
    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#70
    def __callbacks; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#70
    def __callbacks=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#70
    def __callbacks?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/form_builder.rb#35
    def _default_form_builder; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/form_builder.rb#35
    def _default_form_builder=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/form_builder.rb#35
    def _default_form_builder?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/flash.rb#10
    def _flash_types; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/flash.rb#10
    def _flash_types=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/flash.rb#10
    def _flash_types?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/helpers.rb#13
    def _helper_methods; end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/helpers.rb#13
    def _helper_methods=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/helpers.rb#13
    def _helper_methods?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/helpers.rb#17
    def _helpers; end

    # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#211
    def _layout; end

    # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#211
    def _layout=(value); end

    # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#211
    def _layout?; end

    # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#212
    def _layout_conditions; end

    # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#212
    def _layout_conditions=(value); end

    # source://actionview/7.2.0.alpha.053470a/lib/action_view/layouts.rb#212
    def _layout_conditions?; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#916
    def _process_action_callbacks; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/callbacks.rb#920
    def _process_action_callbacks=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/renderers.rb#33
    def _renderers; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/renderers.rb#33
    def _renderers=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/renderers.rb#33
    def _renderers?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching.rb#44
    def _view_cache_dependencies; end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching.rb#44
    def _view_cache_dependencies=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching.rb#44
    def _view_cache_dependencies?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/params_wrapper.rb#185
    def _wrapper_options; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/params_wrapper.rb#185
    def _wrapper_options=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/params_wrapper.rb#185
    def _wrapper_options?; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def allow_forgery_protection; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def allow_forgery_protection=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def asset_host; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def asset_host=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def assets_dir; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def assets_dir=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def csrf_token_storage_strategy; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def csrf_token_storage_strategy=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def default_asset_host_protocol; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def default_asset_host_protocol=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def default_static_extension; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def default_static_extension=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_dispatch/routing/url_for.rb#100
    def default_url_options; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_dispatch/routing/url_for.rb#100
    def default_url_options=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_dispatch/routing/url_for.rb#100
    def default_url_options?; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def enable_fragment_cache_logging; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def enable_fragment_cache_logging=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/etag_with_template_digest.rb#31
    def etag_with_template_digest; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/etag_with_template_digest.rb#31
    def etag_with_template_digest=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/etag_with_template_digest.rb#31
    def etag_with_template_digest?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/conditional_get.rb#15
    def etaggers; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/conditional_get.rb#15
    def etaggers=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/conditional_get.rb#15
    def etaggers?; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def forgery_protection_origin_check; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def forgery_protection_origin_check=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def forgery_protection_strategy; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def forgery_protection_strategy=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching/fragments.rb#26
    def fragment_cache_keys; end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching/fragments.rb#26
    def fragment_cache_keys=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/caching/fragments.rb#26
    def fragment_cache_keys?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#70
    def helpers_path; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#70
    def helpers_path=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#70
    def helpers_path?; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#71
    def include_all_helpers; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#71
    def include_all_helpers=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/helpers.rb#71
    def include_all_helpers?; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def javascripts_dir; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def javascripts_dir=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def log_warning_on_csrf_failure; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def log_warning_on_csrf_failure=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def logger; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def logger=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal.rb#263
    def middleware_stack; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def per_form_csrf_tokens; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def per_form_csrf_tokens=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def perform_caching; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def perform_caching=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/callbacks.rb#36
    def raise_on_missing_callback_actions; end

    # source://actionpack/7.2.0.alpha.053470a/lib/abstract_controller/callbacks.rb#36
    def raise_on_missing_callback_actions=(val); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/redirecting.rb#17
    def raise_on_open_redirects; end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/metal/redirecting.rb#17
    def raise_on_open_redirects=(val); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def relative_url_root; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def relative_url_root=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def request_forgery_protection_token; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def request_forgery_protection_token=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/rescuable.rb#15
    def rescue_handlers; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/rescuable.rb#15
    def rescue_handlers=(value); end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/rescuable.rb#15
    def rescue_handlers?; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#115
    def stylesheets_dir; end

    # source://activesupport/7.2.0.alpha.053470a/lib/active_support/configurable.rb#116
    def stylesheets_dir=(value); end

    # source://actionpack/7.2.0.alpha.053470a/lib/action_controller/base.rb#219
    def without_modules(*modules); end
  end
end

module ERB::Escape
  private

  def html_escape(_arg0); end

  class << self
    def html_escape(_arg0); end
  end
end

# source://gettext_i18n_rails//lib/gettext_i18n_rails/version.rb#1
module GettextI18nRails
  # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#2
  def translations_are_html_safe; end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#2
  def translations_are_html_safe=(val); end

  class << self
    # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#2
    def translations_are_html_safe; end

    # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#2
    def translations_are_html_safe=(val); end
  end
end

# translates i18n calls to gettext calls
#
# source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#3
class GettextI18nRails::Backend
  # @return [Backend] a new instance of Backend
  #
  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#8
  def initialize(*args); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#12
  def available_locales; end

  # Returns the value of attribute backend.
  #
  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#6
  def backend; end

  # Sets the attribute backend
  #
  # @param value the value to set the attribute backend to.
  #
  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#6
  def backend=(_arg0); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#34
  def method_missing(method, *args); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#16
  def translate(locale, key, options); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#5
  def translate_defaults; end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#5
  def translate_defaults=(val); end

  protected

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#64
  def discard_pass_through_key(key, translation); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#87
  def flatten_key(key, options); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#40
  def gettext_key(key, options); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#72
  def interpolate(string, values); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#57
  def plural_translate(gettext_key, options); end

  class << self
    # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#5
    def translate_defaults; end

    # source://gettext_i18n_rails//lib/gettext_i18n_rails/backend.rb#5
    def translate_defaults=(val); end
  end
end

# source://gettext_i18n_rails//lib/gettext_i18n_rails/gettext_hooks.rb#2
module GettextI18nRails::GettextHooks
  class << self
    # shorter call / maybe the interface changes again ...
    #
    # source://gettext_i18n_rails//lib/gettext_i18n_rails/gettext_hooks.rb#4
    def add_parser(parser); end

    # source://gettext_i18n_rails//lib/gettext_i18n_rails/gettext_hooks.rb#8
    def xgettext; end
  end
end

# source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#4
module GettextI18nRails::HtmlSafeTranslations
  # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#10
  def _(*args); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#14
  def n_(*args); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#18
  def s_(*args); end

  private

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#24
  def html_safe_if_wanted(text); end

  class << self
    # also make available on class methods
    #
    # source://gettext_i18n_rails//lib/gettext_i18n_rails/html_safe_translations.rb#6
    def included(base); end
  end
end

# source://gettext_i18n_rails//lib/gettext_i18n_rails.rb#5
GettextI18nRails::IGNORE_TABLES = T.let(T.unsafe(nil), Array)

# source://gettext_i18n_rails//lib/gettext_i18n_rails/railtie.rb#2
class GettextI18nRails::Railtie < ::Rails::Railtie; end

# source://gettext_i18n_rails//lib/gettext_i18n_rails/version.rb#2
GettextI18nRails::VERSION = T.let(T.unsafe(nil), String)

# source://gettext_i18n_rails//lib/gettext_i18n_rails/version.rb#2
GettextI18nRails::Version = T.let(T.unsafe(nil), String)

# source://gettext_i18n_rails//lib/gettext_i18n_rails/i18n_hacks.rb#3
module I18n
  extend ::I18n::Base

  class << self
    # source://i18n/1.14.4/lib/i18n/backend/fallbacks.rb#17
    def fallbacks; end

    # source://i18n/1.14.4/lib/i18n/backend/fallbacks.rb#23
    def fallbacks=(fallbacks); end

    # source://i18n/1.14.4/lib/i18n/interpolate/ruby.rb#23
    def interpolate(string, values); end

    # source://i18n/1.14.4/lib/i18n/interpolate/ruby.rb#29
    def interpolate_hash(string, values); end

    # source://i18n/1.14.4/lib/i18n.rb#37
    def new_double_nested_cache; end

    # source://i18n/1.14.4/lib/i18n.rb#45
    def reserve_key(key); end

    # source://i18n/1.14.4/lib/i18n.rb#50
    def reserved_keys_pattern; end
  end
end

class I18n::ArgumentError < ::ArgumentError; end

# source://gettext_i18n_rails//lib/gettext_i18n_rails/i18n_hacks.rb#4
class I18n::Config
  # source://i18n/1.14.4/lib/i18n/config.rb#43
  def available_locales; end

  # source://i18n/1.14.4/lib/i18n/config.rb#57
  def available_locales=(locales); end

  # source://i18n/1.14.4/lib/i18n/config.rb#64
  def available_locales_initialized?; end

  # source://i18n/1.14.4/lib/i18n/config.rb#50
  def available_locales_set; end

  # source://i18n/1.14.4/lib/i18n/config.rb#20
  def backend; end

  # source://i18n/1.14.4/lib/i18n/config.rb#25
  def backend=(backend); end

  # source://i18n/1.14.4/lib/i18n/config.rb#70
  def clear_available_locales_set; end

  # source://i18n/1.14.4/lib/i18n/config.rb#30
  def default_locale; end

  # source://i18n/1.14.4/lib/i18n/config.rb#35
  def default_locale=(locale); end

  # source://i18n/1.14.4/lib/i18n/config.rb#75
  def default_separator; end

  # source://i18n/1.14.4/lib/i18n/config.rb#80
  def default_separator=(separator); end

  # source://i18n/1.14.4/lib/i18n/config.rb#141
  def enforce_available_locales; end

  # source://i18n/1.14.4/lib/i18n/config.rb#145
  def enforce_available_locales=(enforce_available_locales); end

  # source://i18n/1.14.4/lib/i18n/config.rb#86
  def exception_handler; end

  # source://i18n/1.14.4/lib/i18n/config.rb#91
  def exception_handler=(exception_handler); end

  # source://i18n/1.14.4/lib/i18n/config.rb#151
  def interpolation_patterns; end

  # source://i18n/1.14.4/lib/i18n/config.rb#161
  def interpolation_patterns=(interpolation_patterns); end

  # source://i18n/1.14.4/lib/i18n/config.rb#126
  def load_path; end

  # source://i18n/1.14.4/lib/i18n/config.rb#132
  def load_path=(load_path); end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/i18n_hacks.rb#5
  def locale; end

  # source://gettext_i18n_rails//lib/gettext_i18n_rails/i18n_hacks.rb#9
  def locale=(new_locale); end

  # source://i18n/1.14.4/lib/i18n/config.rb#97
  def missing_interpolation_argument_handler; end

  # source://i18n/1.14.4/lib/i18n/config.rb#114
  def missing_interpolation_argument_handler=(exception_handler); end
end

class I18n::MissingTranslationData < ::I18n::ArgumentError
  include ::I18n::MissingTranslation::Base
end

class Object < ::BasicObject
  include ::Kernel
  include ::JSON::Ext::Generator::GeneratorMethods::Object
  include ::PP::ObjectMixin
  include ::ActiveSupport::Tryable
  include ::FastGettext::Translation
  include ::GettextI18nRails::HtmlSafeTranslations
  include ::ERB::Escape
  include ::ActiveSupport::CoreExt::ERBUtil
  include ::ActiveSupport::CoreExt::ERBUtilPrivate
end

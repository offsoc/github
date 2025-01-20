# frozen_string_literal: true

require "#{Rails.root}/test/test_helpers/sham"
require "factory_bot"
FactoryBot.definition_file_paths += Dir.glob("packages/**/test/factories")
require "factory_bot_rails"

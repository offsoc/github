# frozen_string_literal: true
task :emoji do
  require "emoji"

  target = "#{Rails.root}/public/images/icons/emoji"

  mkdir_p "#{target}"
  Dir["#{Emoji.images_path}/emoji/*.png"].each do |src|
    cp src, "#{target}/"
  end

  mkdir_p "#{target}/unicode"
  Dir["#{Emoji.images_path}/emoji/unicode/*.png"].each do |src|
    cp src, "#{target}/unicode/"
  end
end

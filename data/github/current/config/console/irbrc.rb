# frozen_string_literal: true

require "irb/history"

# Custom GitHub Console Prompt in Production envs
white_on_red = "\e[37m\e[41m%s\e[0m"
env = GitHub.heaven_env == "production" ? "" : " (#{GitHub.heaven_env})"
prefix = white_on_red % "GitHub[production#{env}]"

IRB.conf[:PROMPT][:GITHUB_PRODUCTION] = {
  PROMPT_I: "#{prefix} (%m):%03n:%i> ",  # Normal Prompt
  PROMPT_N: "#{prefix} (%m):%03n:%i> ",  # Multiline definition
  PROMPT_S: "#{prefix} (%m):%03n:%i%l ", # Multiline string
  PROMPT_C: "#{prefix} (%m):%03n:%i* ",  # Multiline expression
  RETURN: "=> %s\n",            # Return
}
IRB.conf[:PROMPT_MODE] = :GITHUB_PRODUCTION if Rails.env.production?
IRB.conf[:SAVE_HISTORY] = 10_000 if Rails.env.development?
IRB.conf[:HISTORY_FILE] = File.join(ENV["HOME"], ".irb_history")

# Load up normal irbrc file if one exists
ENV["IRBRC"] = ENV["IRBRC_WAS"]
begin
  IRB.irbrc_files.each do |rc_file|
    load rc_file if rc_file != __FILE__
  end
rescue LoadError, Errno::ENOENT
end

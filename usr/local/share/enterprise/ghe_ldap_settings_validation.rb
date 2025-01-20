# frozen_string_literal: true
require 'manage'
require 'logger'

##
# This class exercises the validation of the current GHES LDAP settings

class LDAPSettingsValidation
  def initialize
    @logger = get_logger
    unless Manage.enterprise_settings.ldap?
      @logger.info "Unable to run validation checks as LDAP is disabled."
      exit 1
    end
    # Sets the logger that will be used by the LdapSettingsValidator class
    Manage.logger = @logger
    @settings = Manage.enterprise_settings.ldap
    # Sets search_text to '*' so that the search check searches for any user
    @settings.search_test = "*"
  end

  def start_validation
    begin
      # valid? triggers validation using the LdapSettingsValidator class
      if @settings.valid?
        @logger.info "All LDAP validation checks succeeded."
        exit 0
      else
        if @settings.errors.include?(:connection)
          @settings.errors.full_messages_for(:connection).each do |message|
            @logger.info " - #{message}"
          end
        end
        exit 1
      end
    rescue StandardError => e
      @logger.error "Unexpected error occurred: #{e.class} - #{e.message}"
    end
  end

  private

  def get_logger
    logger = Logger.new(STDOUT)
    logger.level = Logger::INFO
    logger.formatter = proc do |severity, datetime, _progname, msg|
      "#{msg}\n"
    end
    return logger
  end
end

LDAPSettingsValidation.new.start_validation

require "aqueduct/version"
require "aqueduct/client"
require "aqueduct/worker"
require "socket"
require 'json'

module Aqueduct
  DEFAULT_URL = "https://aqueduct-gateway-production.service.iad.github.net/twirp"
  DEFAULT_TAGS = Hash.new

  MISSING_APP_ERROR = <<~ERROR
    Missing app config! Please configure your aqueduct app name. For example:

      Aqueduct.configure do |config|
        config.app = "your-app-production"
      end
  ERROR

  def self.configure
    yield self
  end

  def self.url=(url)
    @url = url
  end

  def self.url
    @url || ENV["AQUEDUCT_URL"] || DEFAULT_URL
  end

  def self.app=(app)
    @app = app.strip
  end

  def self.app
    @app || ENV["AQUEDUCT_APP"] || raise(ArgumentError.new(MISSING_APP_ERROR))
  end

  def self.hostname=(hostname)
    @hostname = hostname.strip
  end

  def self.hostname
    @hostname || ENV["AQUEDUCT_HOSTNAME"] || Socket.gethostname
  end

  def self.client_id=(client_id)
    @client_id = client_id
  end

  def self.client_id
    return @client_id if defined?(@client_id)

    ENV["AQUEDUCT_CLIENT_ID"] || "#{Socket.gethostname}:#{Process.pid}"
  end

  def self.site=(site)
    @site = site
  end

  def self.site
    @site || ENV["AQUEDUCT_SITE"] || ENV["KUBE_SITE"] || site_from_metadata
  end

  def self.tags=(tags)
    @tags = tags
  end

  def self.tags
    @tags || DEFAULT_TAGS
  end

  def self.site_from_metadata
    begin
      metadata = File.read("/etc/github/metadata.json")
      JSON.parse(metadata)["site"]
    rescue
    # File not found
    end
  end

end

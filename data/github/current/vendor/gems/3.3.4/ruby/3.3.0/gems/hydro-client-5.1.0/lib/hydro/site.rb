module Hydro
  class Site
    # site - a string representing the site
    def initialize(site)
      if site.to_sym == Hydro::Schemas::Hydro::V1::Envelope::Site.lookup(Hydro::Schemas::Hydro::V1::Envelope::Site::UNKNOWN)
        raise InvalidSiteError.new(site)
      end

      @site = site.to_s
    end

    # Returns a protobuf enum value to write to the envelope
    def site_for_envelope
      envelope_site = Hydro::Schemas::Hydro::V1::Envelope::Site.resolve(normalized_site.to_sym)
      if envelope_site.nil?
        raise InvalidSiteError.new(@site)
      end
      envelope_site
    end

    def to_sym
      @site.to_sym
    end

    def to_s
      @site
    end

    def ==(other)
      other.is_a?(Hydro::Site) && to_s == other.to_s
    end

    def hash
      to_s.hash
    end

    private

    def normalized_site
      @site.upcase.gsub("-", "_")
    end
  end

  class InvalidSiteError < Hydro::Error
    def initialize(site)
      @site = site
    end

    def message
      "Invalid site #{@site.inspect}"
    end
  end
end

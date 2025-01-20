# frozen_string_literal: true

module AdvisoryDBToolkit
  # helper module for sorting a list of references

  module ReferenceSorter
    # these match urls to the official CVE pages for NVD and MITRE respectively
    NVD_CVE_PATTERN = %r{\Ahttps://nvd\.nist\.gov/vuln/detail/CVE-\d{4}-\d+\z}
    MITRE_CVE_PATTERN = %r{\Ahttps://cve\.mitre\.org/cgi-bin/cvename.cgi\?name=CVE-\d{4}-\d+\z}

    # We want the best external reference on top, everytime,
    # Only the top URL in advisory reference list is actually publicly published (the external_reference)
    # The URLs we want on top follow a hierarchy of preference:
    # - If there is a GitHub security advisory, we prefer this the most
    # - otherwise, if there is a CVE, the nvd page is best
    # - otherwise, use a github issue, PR, or commit, in that order.  This happens in whitesource advisories generally
    # - otherwise use a hacker one report
    # - all other URLs are below these "preferred urls", and sorted alphabetically, and should generally not suitable as the top reference
    PREFERRED_URL_PATTERNS = [
      %r{\Ahttps://github\.com/[^/]+/[^/]+/security/advisories/GHSA-[^/]+\z},
      NVD_CVE_PATTERN,
      %r{\Ahttps://github\.com/[^/]+/[^/]+/issues/},
      %r{\Ahttps://github\.com/[^/]+/[^/]+/pull/},
      %r{\Ahttps://github\.com/[^/]+/[^/]+/commit/},
      %r{\Ahttps://hackerone\.com/reports/\d+\z},
    ].freeze

    def self.normalize_url(url)
      return unless url
      
      normalized_url = url.strip
      normalized_url.chop! if normalized_url[-1] == "/"

      normalized_url
    end

    # return the index of the preferred url, or nil if it is not a preferred url
    def self.preferred_url_index(url)
      PREFERRED_URL_PATTERNS.find_index { |url_pattern| url_pattern.match?(url) }
    end

    # return a unique list of URLs, sorted to our particular scheme
    def self.sorted_reference_list(url_list)
      # Sorting should work as follows:
      # - All https urls above everything else.  The "everything else" is sorted alphabetically
      # - Preferred urls above non-preferred URLs.
      # - Preferred urls sorted by which have most preferrence
      # - if preferrence is same, then sort alphabetically
      # - non-preferred urls are sorted alphabetically
      https_urls, non_https_urls = url_list.map { |url| normalize_url(url) }.compact.uniq.partition { |url| url.start_with?("https://") }

      sorted_urls = https_urls.sort.sort_by { |url| preferred_url_index(url) || PREFERRED_URL_PATTERNS.length }

      sorted_urls + non_https_urls.sort
    end

    # this method returns a list of references intended for submission the MITRE in a CVE
    # the only difference from above method is it excludes the NVD and MITRE links,
    # which would be circular in the case of a MITRE submission
    def self.sorted_reference_list_for_cve(url_list)
      sorted_reference_list(url_list).delete_if do |url|
        NVD_CVE_PATTERN.match?(url) || MITRE_CVE_PATTERN.match?(url)
      end
    end
  end
end

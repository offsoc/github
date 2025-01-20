module SpamuraiDevKit
  module OctocaptchaUrlHelpers
    def host_name
      if is_production_env? || is_staging_env?
        "octocaptcha.com".freeze
      else
        "octocaptcha.localhost".freeze
      end
    end

    def url
      if is_production_env? || is_staging_env?
        "https://#{host_name}".freeze
      else
        "http://#{host_name}".freeze
      end
    end

    # Generates octocaptcha iframe url
    # origin_url - the url of your website. ex enterprise.github.com
    #   Defaults to app_url configuration
    # origin_page - name of your page. defaults to app_name + feature name
    def url_for_iframe(
      origin_url: app_url,
      origin_page: "#{app_name}_#{feature_name}".gsub("-", "_"),
      responsive: true,
      nojs: false
    )
      octocaptcha_params = ["origin=#{origin_url}"]

      octocaptcha_params << if is_production_env? || is_staging_env?
        "origin_page=#{origin_page}"
      else
        "origin_page=localhost"
      end

      octocaptcha_params << "responsive=true" if responsive
      octocaptcha_params << "nojs=true" if nojs

      "#{url}?#{octocaptcha_params.join("&")}"
    end
  end
end

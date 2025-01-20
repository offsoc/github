# typed: true
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

if GitHub.enterprise? || GitHub.multi_tenant_enterprise?
  # To ensure these paths don't 404 on Enterprise or Proxima, we redirect them to Dotcom
  # where these marketing pages are served.
  get "/features",         to: redirect("https://github.com/features")
  get "/features/actions", to: redirect("https://github.com/features/actions")
  get "/features/:id",     to: redirect("https://github.com/features/%{id}")
end

unless GitHub.enterprise?
  scope module: :site do
    get "/home", to: "home#index", as: :homepage
    get "/site", to: "home#index", format: false if Rails.env == "test"

    # Indexnow requires the api key text file to be set at the root
    get "/#{GitHub.bing_indexnow_api_key}", to: "bing_indexnow#index"

    get "/globe",                to: "globe#index"
    get "/lab",                  to: "lab#index"
    get "/lab/layout",           to: "lab#layout"
    get "/lab/typography",       to: "lab#typography"
    get "/lab/copilot",          to: "lab#copilot"
    get "/lab/editor",           to: "lab#editor"
    get "/logos",                to: "logos#index"
    get "/mona-sans",            to: "mona_sans#index"
    get "/mona-sans/playground", to: "mona_sans#playground"
    get "/open-source",          to: "open_source#index"
    get "/planning-tracking",    to: "planning_tracking#index"
    get "/enterprise/premium-support",      to: "enterprise/premium_support#index", as: :premium_support_page
    get "/site-map",             to: redirect("/sitemap")
    get "/sitemap",              to: "sitemap#index"
    get "/sitemap_marketing",    to: "sitemap_marketing#index", format: "xml"
    get "/solutions/ci-cd",      to: "solutions_ci_cd#index"
    get "/team",                 to: "team#index", as: :team_marketing_page
    get "/events",               to: redirect("https://resources.github.com/events")

    get "about", to: "about#index"
    namespace :about do
      get "/developer-policy",      to: "policy#index"
      get "/developer-policy/news", to: "policy#news"
      get "/leadership",            to: "leadership#index"
      get "/press",                 to: "press#index"

      get "/diversity/communities-of-belonging",             to: "diversity/communities#index", as: "communities-of-belonging"
      get "/diversity/communities-of-belonging/blacktocats", to: "diversity/blacktocats#index", as: "blacktocats"
      get "/diversity/report",                               to: "diversity/report#index"
    end

    get "/features", to: "features#index"
    namespace :features do
      get "/actions",                        to: "actions#index"
      get "/code-review",                    to: "code_review#index"
      get "/code-search",                    to: "code_search#index"
      get "/codespaces",                     to: "codespaces#index"
      get "/copilot",                        to: "copilot#index"
      get "/copilot/plans",                  to: "copilot/plans#index"
      get "/copilot/signup",                 to: redirect("/features/copilot/plans"), as: nil
      get "/discussions",                    to: "discussions#index"
      get "/integrations",                   to: "integrations#index"
      get "/issues",                         to: "issues#index"
      get "/packages",                       to: "packages#index"
      get "/project-management",             to: "project_management#index"
    end

    get "/enterprise", to: "enterprise#index", as: :enterprise_marketing_page
    namespace :enterprise do
      resources :contact_requests, only: [:index, :create], path: "contact" do
        get "thanks", to: "contact_requests/thanks#index", on: :collection
      end

      get "/advanced-security",   to: "advanced_security#index"
      get "/startups",            to: "startups#index",      as: :startups_page
      get "/startups/acceptance", to: "startups#acceptance", as: :startups_acceptance_page
      get "/startups/partners",   to: "startups#partners",   as: :startups_partners_page
      get "/startups/thankyou",   to: "startups#thanks",     as: :startups_thanks_page
      get "/trial",               to: "trials#index",        as: :trial_page
      get "/trial/callback",      to: "trials#callback"
      get "/trial/start",         to: "trials#start",        as: :trial_start_page
    end

    resources :services, only: [:index, :show], path: "services" do
      get "terms-and-conditions", to: "services#terms_and_conditions", on: :collection
      get "thankyou", to: "services#thanks", on: :collection
      get "catalog", to: redirect("/services#services-catalog"), on: :collection
    end

    get "/pricing", to: "pricing#index"
    namespace :pricing do
      resources :calculator, only: [:index]
    end

    get "/security",                    to: "security#index"
    get "/security/trust",              to: redirect("/security")
    get "/security/team",               to: redirect("/security")
    get "/security/incident-response",  to: redirect("/security")

    resources :git_guides, only: [:index, :show], path: "git-guides"

    resources :events, only: [:index, :show]

    get "/enterprise-legal", to: redirect("/customer-terms")
    resources :customer_terms, only: [:index, :show], path: "customer-terms", as: "customer_term" do
      get "updates", to: "customer_terms#updates", on: :collection
      get "github-addendum-to-microsoft-dpa", to: redirect("/customer-terms/updates#updates-march-2023", status: 303), on: :collection
    end

    resources :procurement, only: [:index, :show], path: "procurement-legal", as: "procurement_legal"

    namespace :readme do
      resources :developer_stories, only: [:index, :show], path: "stories"
      resources :featured_articles, only: [:index, :show], path: "featured"
      resources :guides,            only: [:index, :show]
      resources :podcasts,          only: [:index, :show], path: "podcast"

      resources :topics, only: [:index, :show]
      resources :subscriptions, only: :create, defaults: { format: :js }

      get "/culture",      to: redirect("/readme/topics/culture")
      get "/devops",       to: redirect("/readme/topics/devops")
      get "/open-source",  to: redirect("/readme/topics/open-source")
      get "/security",     to: redirect("/readme/topics/security")
      get "/application-security", to: redirect("/readme/topics/application-security")
      get "/career-development", to: redirect("/readme/topics/career-development")
      get "/devops-automation", to: redirect("/readme/topics/devops-automation")
      get "/maintainer",  to: redirect("/readme/topics/maintainer")
      get "/programming", to: redirect("/readme/topics/programming")
      get "/artificial-intelligence", to: redirect("/readme/topics/artificial-intelligence")

      get "/maintainers",             to: redirect("/readme/stories")
      get "/features",                to: redirect("/readme/featured")
      get "/community-contributions", to: redirect("/readme/guides")

      get "/nominate", to: "nominate#show"
    end
    get "readme.:format", to: "readme#rss", constraints: { format: :rss }
    resources :readme, only: [:show, :index]

    resources :customer_stories, only: [:index, :show], path: "customer-stories" do
      collection do
        get "/:category", to: "customer_stories/categories#show", constraints: { category: /(enterprise|team|all)/ }, as: "category"
        get "/search", to: "customer_stories/search#index"
      end
    end

    if GitHub.security_dot_txt_enabled?
      get "/.well-known/security.txt", to: "security#txt"
    end

    # Contact Sales Requests
    resources :contact_sales_requests, only: [:create], path: "/contact-sales"

    #########################################################################
    # If you're creating new landing pages using the landing-pages React app,
    # please add them here:
    #########################################################################
    get "/contentful-lp-tests/boomtown", to: "landing_pages#boomtown"

    [
      "/contact-sales",
      "/contact-sales/*path", # Targeted contact sales pages
      "/contentful-e2e-test-do-not-remove",
      "/github-and-vscode",
      "/universe-23-waitlist-test",
      "/features/preview/copilot-enterprise",
      "/features/preview/copilot-customization",
      "/features/preview/copilot-partner-program",
      "/features/preview/security",
      "/features/preview/azure-virtual-networks",
      "/features/preview/emu-non-members",
      "/features/preview",
      "/solutions/devops",
      "/solutions/devsecops",
      "/solutions/industries/manufacturing",
      "/solutions/industries/healthcare",
      "/solutions/industries/financial-services",
      "/about/diversity",
      "/features/copilot/getting-started",
      "/roadmap-webinar-series",
      "/features/copilot/getting-started/visual-studio",
      "/education",
      "/education/*path",
      "/social-impact",
      "/social-impact/*path",
      "/mobile",
      "/enterprise/advanced-security/what-is-github-advanced-security",
      "/apps/desktop",
      "/apps/desktop/*path",
      "/features/security/software-supply-chain",
      "/features/security/code-scanning",
      "/features/security",
      "/accelerator",
      "/trust-center",
      "/trust-center/*path",
      "/features/actions/getting-started",
      "/enterprise/migrating-to-github",
      "/frequently-asked-questions",

      # catch-all route for internal testing
      "/contentful-lp-tests/*path",
    ].each do |path|
      get path, to: "landing_pages#show"
    end

    get "/resources/articles/:topic/:path",  to: "resources/articles#show"
    get "/resources/articles/:topic", to: "resources/articles#index"
    get "/resources/articles", to: "resources/articles#index"

    # Solutions templates
    resources :solutions, only: [:index], path: "solutions" do
      collection do
        get "/:category", to: "solutions#category"
        get "/:category/:solution", to: "solutions#show"
      end
    end

    # Newsroom templates
    get "/newsroom", to: "newsroom#index"
    get "/newsroom/press-releases/:slug", to: "newsroom#show"
  end

  # Legacy redirects
  get "/about/careers/remote",               to: redirect("https://github.careers")
  get "/about/facts",                        to: redirect("/about")
  get "/about/internships",                  to: redirect("/about/jobs#internships")
  get "/about/careers",                      to: redirect("https://github.careers")
  get "/about/jobs",                         to: redirect("https://github.careers")
  get "/about/mentions",                     to: redirect("/about/press")
  get "/about/milestones",                   to: redirect("/about")
  get "/about/press/satellite",              to: redirect("/about/press")
  get "/about/press/universe",               to: redirect("/about/press")
  get "/about/team",                         to: redirect("/about")
  get "/buildingthefuture",                  to: redirect("/readme")
  get "/buildingthefuture/conrad",           to: redirect("/readme")
  get "/buildingthefuture/jamica",           to: redirect("/readme")
  get "/buildingthefuture/julius",           to: redirect("/readme")
  get "/buildingthefuture/tiffani",          to: redirect("/readme")
  get "/business",                           to: redirect("/enterprise")
  get "/business/customer",                  to: redirect("/customer-stories?type=enterprise")
  get "/business/customers",                 to: redirect("/customer-stories?type=enterprise")
  get "/business/customers/:customer_story", to: redirect("/customer-stories/%{customer_story}")
  get "/business/features",                  to: redirect("/pricing#compare")
  get "/business/partners",                  to: redirect("https://partner.github.com")
  get "/business/security",                  to: redirect("/features/enterprise")
  get "/business/why-github-for-work",       to: redirect("/enterprise")
  get "/careers",                            to: redirect("https://github.careers")
  get "/case-studies?type=customers",        to: redirect("/customer-stories?type=enterprise")
  get "/case-studies",                       to: redirect("/customer-stories")
  get "/case-studies/:customer_story",       to: redirect("/customer-stories/%{customer_story}")
  get "/choose-team",                        to: redirect("/team")
  get "/cloud-trial",                        to: redirect("/enterprise")
  get "/customer",                           to: redirect("/customer-stories", status: 302)
  get "/customers",                          to: redirect("/customer-stories")
  get "/developer-stories",                  to: redirect("/readme")
  get "/developer-stories/alicia",           to: redirect("/readme")
  get "/developer-stories/amy",              to: redirect("/readme")
  get "/developer-stories/lisa",             to: redirect("/readme")
  get "/developer-stories/mario",            to: redirect("/readme")
  get "/edu",                                to: redirect("/education")
  get "/edu/students",                       to: redirect("/education/students")
  get "/edu/teachers",                       to: redirect("/education/teachers")
  get "/edu/schools",                        to: redirect("/education/schools")
  get "/edu/partners",                       to: redirect("/education/partners")
  get "/edu/schools/terms",                  to: redirect("/education/schools/terms")
  get "/edu/students/experts/terms",         to: redirect("/education/students/experts/terms")
  get "/enterprise/security",                to: redirect("/features/security")
  get "/features/insights",                  to: redirect("https://docs.github.com/enterprise-server@3.0/insights")
  get "/features/package-registry",          to: redirect("/features/packages")
  get "/humans.txt",                         to: redirect("/about")
  get "/learn",                              to: redirect("https://resources.github.com/")
  get "/learn/devops",                       to: redirect("https://resources.github.com/devops/")
  get "/learn/forrester",                    to: redirect("https://resources.github.com/forrester/")
  get "/learn/security",                     to: redirect("https://resources.github.com/appsec/")
  get "/nonprofit",                          to: redirect("https://socialimpact.github.com")
  get "/open-source/stories",                to: redirect("/customer-stories?type=open+source")
  get "/open-source/stories/:username",      to: redirect("/customer-stories/%{username}")
  get "/personal",                           to: redirect("/pricing")
  get "/features/preview/copilot-x",         to: redirect("/features/copilot")
  get "/premium-support",                    to: redirect("/enterprise/premium-support")
  get "/pricing/business-cloud",             to: redirect("/pricing", status: 302)
  get "/pricing/business-enterprise",        to: redirect("/pricing", status: 302)
  get "/pricing/business-hosted",            to: redirect("/pricing", status: 302)
  get "/pricing/developer",                  to: redirect("/pricing", status: 302)
  get "/pricing/enterprise",                 to: redirect("/pricing", status: 302)
  get "/pricing/plans",                      to: redirect("/pricing")
  get "/pricing/team",                       to: redirect("/pricing", status: 302)
  get "/resources",                          to: redirect("https://resources.github.com/")
  get "/save-net-neutrality",                to: redirect("#{GitHub.blog_url}/2018-02-27-one-more-vote-for-net-neutrality-and-beyond/")
  get "/ten",                                to: redirect("/")
  get "/universe-2016",                      to: redirect("/features")
  get "/features/security/code",             to: redirect("/features/security/code-scanning")

  namespace :localization do
    resources :translations, only: [:create]
  end

  # ExperimentsVariantsController
  # /exp/:namespace/variants - return all variants for a given namespace
  # /exp/:namespace/variants/:variant - return specific variant value
  get "/exp/:namespace/variants", to: "experiments_variants#index", format: "json"
  get "/exp/:namespace/variants/:variant", to: "experiments_variants#show", format: "json"

  # Pi Day easter egg
  get "/π", to: "pi#index" # Greek small letter pi symbol
  get "/Π", to: "pi#index" # Greek capital letter pi symbol
  get "/ϖ", to: "pi#index" # Greek pi symbol
  get "/𝜫", to: "pi#index" # Mathematical bold italic capital pi symbol
  get "/𝝅", to: "pi#index" # Mathematical bold italic small pi symbol
  get "/𝝥", to: "pi#index" # Mathematical sans-serif bold capital pi symbol
  get "/𝝿", to: "pi#index" # Mathematical sans-serif bold small pi symbol
  get "/𝞟", to: "pi#index" # Mathematical sans-serif bold italic capital pi symbol
  get "/𝞹", to: "pi#index" # Mathematical sans-serif bold italic small pi symbol
  get "/П", to: "pi#index" # Cyrillic capital letter pi symbol
  get "/п", to: "pi#index" # Cyrillic small letter pi symbol
  get "/∏", to: "pi#index" # N-ary product pi symbol
  get "/∐", to: "pi#index" # N-ary coproduct pi symbol
  get "/🥧", to: "pi#index" # Emoji FTW
end

if GitHub.enterprise?
  # The following links might exist in features running on Enterprise.
  # This ensures the path helpers are available for that.
  # Futher cleanup might remove those references in Enterprise completely.
  get "/about",            to: redirect("https://github.com/about")
  get "/about/:id",        to: redirect("https://github.com/about/%{id}")
  get "/events",           to: redirect("https://github.com/events")
  get "/events/:id",       to: redirect("https://github.com/events/%{id}"), as: "event"
  get "/humans.txt",       to: redirect("https://github.com/humans.txt")
end

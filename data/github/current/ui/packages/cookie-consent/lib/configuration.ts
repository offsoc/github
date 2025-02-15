import type {ICookieCategoriesPreferences, ICookieCategory, IOptions, ITextResources} from 'consent-banner'

enum CookieCategoryId {
  Required = 'Required',
  Analytics = 'Analytics',
  SocialMedia = 'SocialMedia',
  Advertising = 'Advertising',
}

enum CookieCategoryName {
  Required = 'Required',
  Analytics = 'Analytics',
  SocialMedia = 'Social Media',
  Advertising = 'Advertising',
}

const privacyPolicyUrl = 'https://docs.github.com/site-policy/privacy-policies/github-privacy-statement'
const cookieInventoryUrl = 'https://docs.github.com/site-policy/privacy-policies/github-subprocessors-and-cookies'
const docsURL =
  'https://docs.github.com/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-personal-account-settings/managing-your-cookie-preferences-for-githubs-enterprise-marketing-pages'

export const cookieCategories: ICookieCategory[] = [
  {
    id: CookieCategoryId.Required,
    name: CookieCategoryName.Required,
    descHtml:
      'GitHub uses required cookies to perform essential website functions and to provide the services. For example, cookies are used to log you in, save your language preferences, provide a shopping cart experience, improve performance, route traffic between web servers, detect the size of your screen, determine page load times, improve user experience, and for audience measurement. These cookies are necessary for our websites to work.',
    isUnswitchable: true,
  },
  {
    id: CookieCategoryId.Analytics,
    name: CookieCategoryName.Analytics,
    descHtml:
      'We allow third parties to use analytics cookies to understand how you use our websites so we can make them better. For example, cookies are used to gather information about the pages you visit and how many clicks you need to accomplish a task. We also use some analytics cookies to provide personalized advertising.',
  },
  {
    id: CookieCategoryId.SocialMedia,
    name: CookieCategoryName.SocialMedia,
    descHtml:
      "GitHub and third parties use social media cookies to show you ads and content based on your social media profiles and activity on GitHub's websites. This ensures that the ads and content you see on our websites and on social media will better reflect your interests. This also enables third parties to develop and improve their products, which they may use on websites that are not owned or operated by GitHub.",
  },
  {
    id: CookieCategoryId.Advertising,
    name: CookieCategoryName.Advertising,
    descHtml:
      "In addition, GitHub and third parties use advertising cookies to show you new ads based on ads you've already seen. Cookies also track which ads you click or purchases you make after clicking an ad. This is done to show you ads that are more relevant to you and for business purposes with our advertising partners. For example, cookies are used to detect when you click an ad and to show you ads based on your social media interests and website browsing history.",
  },
]

const textResources: ITextResources = {
  bannerMessageHtml: `We use optional cookies to improve your experience on our websites and to display personalized advertising based on your online activity. If you reject optional cookies, only cookies necessary to provide you the services listed above will be used. You may change your selection on which cookies to accept by clicking "Manage Cookies" at the bottom of the page to change your selection. This selection is maintained for 180 days. Please review your selections regularly. <br/> <br/> <a href="${docsURL}">How to manage cookie preferences</a> | <a href="${privacyPolicyUrl}">Privacy Statement</a> | <a href="${cookieInventoryUrl}">Third-Party Cookies</a>.`,
  acceptAllLabel: 'Accept',
  rejectAllLabel: 'Reject',
  moreInfoLabel: 'Manage cookies',
  preferencesDialogCloseLabel: 'Close',
  preferencesDialogTitle: 'Manage cookie preferences',
  preferencesDialogDescHtml: `Most GitHub websites use cookies. Cookies are small text files placed on your device to store data so web servers can use it later. GitHub and our third-party partners use cookies to remember your preferences and settings, help you sign in, show you personalized ads, and analyze how well our websites are working. For more info, see the Cookies and similar technologies section of the <a href="${privacyPolicyUrl}">Privacy Statement</a>.`,
}

export const consentControlOptions: IOptions = {
  textResources,
  themes: {
    /**
     * Use the same defaults that the built-in dark theme uses:
     * https://github.com/microsoft/consent-banner/blob/f38eff3a2f26d2724941db5ef1815e1c58fd134d/src/themes/theme-styles.ts#L41
     * */
    github: {
      /* Required theme properties */
      'close-button-color': '#d8b9ff',
      'secondary-button-disabled-opacity': '0.5',
      'secondary-button-hover-shadow': 'none',
      'primary-button-disabled-opacity': '0.5',
      'primary-button-hover-border': '1px solid transparent',
      'primary-button-disabled-border': '1px solid transparent',
      'primary-button-hover-shadow': 'none',
      'banner-background-color': '#24292f',
      'dialog-background-color': '#24292f',
      'primary-button-color': '#ffffff',
      'text-color': '#ffffff',
      'secondary-button-color': '#32383f',
      'secondary-button-disabled-color': '#424a53',
      'secondary-button-border': '1px solid #eaeef2',

      /* Optional theme properties */
      'background-color-between-page-and-dialog': 'rgba(23, 23, 23, 0.8)',
      'dialog-border-color': '#d8b9ff',
      'hyperlink-font-color': '#d8b9ff',
      'secondary-button-hover-color': '#24292f',
      'secondary-button-hover-border': '1px solid #ffffff',
      'secondary-button-disabled-border': '1px solid #6e7781',
      'secondary-button-focus-border-color': '#6e7781',
      'secondary-button-text-color': '#ffffff',
      'secondary-button-disabled-text-color': '#ffffff',
      'primary-button-hover-color': '#d8b9ff',
      'primary-button-disabled-color': '#ffffff',
      'primary-button-border': '1px solid #ffffff',
      'primary-button-focus-border-color': '#ffffff',
      'primary-button-text-color': '#1f2328',
      'primary-button-disabled-text-color': '#1f2328',
      'radio-button-border-color': '#d8b9ff',
      'radio-button-checked-background-color': '#d8b9ff',
      'radio-button-hover-border-color': '#ffffff',
      'radio-button-hover-background-color': '#ffffff',
      'radio-button-disabled-color': 'rgba(227, 227, 227, 0.2)',
      'radio-button-disabled-border-color': 'rgba(227, 227, 227, 0.2)',
    },
  },
  initialTheme: 'github',
}

const consentRequiredPreferences: ICookieCategoriesPreferences = {
  [CookieCategoryId.Required]: true,
  [CookieCategoryId.Analytics]: false,
  [CookieCategoryId.SocialMedia]: false,
  [CookieCategoryId.Advertising]: false,
}

const consentNotRequiredPreferences: ICookieCategoriesPreferences = {
  [CookieCategoryId.Required]: true,
  [CookieCategoryId.Analytics]: true,
  [CookieCategoryId.SocialMedia]: true,
  [CookieCategoryId.Advertising]: true,
}

export const DefaultCookieConsentPreferences = {
  Required: consentRequiredPreferences,
  NotRequired: consentNotRequiredPreferences,
}

import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {InlineSecurityCheckupNoticeElement} from '../inline-security-checkup-notice-element'

suite('inline-security-checkup-notice-element', () => {
  let container: InlineSecurityCheckupNoticeElement

  setup(async function () {
    container = await fixture(html`
      <inline-security-checkup-notice id="component">
        <!-- BEGIN vendor/gems/3.3.2/ruby/3.3.0/gems/primer_view_components-0.25.1/app/components/primer/alpha/banner.rb --><x-banner
          data-dismiss-scheme="none"
          data-view-component="true"
        >
          <div
            hidden="hidden"
            data-target="inline-security-checkup-notice.inlineSecurityBanner"
            data-test-selector="inline-security-checkup-notice-from-emails"
            data-view-component="true"
            class="inline-emails-banner Banner flash Banner--warning flash-warn"
          >
            <div class="Banner-visual">
              <!-- BEGIN vendor/gems/3.3.2/ruby/3.3.0/gems/primer_view_components-0.25.1/app/components/primer/beta/octicon.rb --><svg
                aria-hidden="true"
                height="16"
                viewBox="0 0 16 16"
                version="1.1"
                width="16"
                data-view-component="true"
                class="octicon octicon-alert"
              >
                <path
                  d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                ></path></svg
              ><!-- END vendor/gems/3.3.2/ruby/3.3.0/gems/primer_view_components-0.25.1/app/components/primer/beta/octicon.rb -->
            </div>
            <div data-view-component="true" class="Banner-message">
              <p class="Banner-title" data-target="x-banner.titleText">
                You have only 1 verified email associated with your GitHub account. Add an additional verified email
                address in case you lose access to your primary email.
              </p>
            </div>
          </div></x-banner
        ><!-- END vendor/gems/3.3.2/ruby/3.3.0/gems/primer_view_components-0.25.1/app/components/primer/alpha/banner.rb -->
      </inline-security-checkup-notice>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, InlineSecurityCheckupNoticeElement)
  })
})

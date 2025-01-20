import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'
import {ChangePasswordElement} from '../change-password-element'

suite('change-password-element', () => {
  let container: ChangePasswordElement

  setup(async function () {
    container = await fixture(html`
    <change-password>
      <!-- BEGIN vendor/gems/3.3.1/ruby/3.3.0/gems/primer_view_components-0.25.0/app/components/primer/beta/subhead.rb -->
      <div data-view-component="true" class="Subhead">
        <h2 data-view-component="true" class="Subhead-heading Subhead-heading--large">Password</h2>

        <div data-view-component="true" class="Subhead-actions"><!-- BEGIN vendor/gems/3.3.1/ruby/3.3.0/gems/primer_view_components-0.25.0/app/components/primer/beta/button.rb -->
          <button data-action="click:change-password#showSection" data-target="change-password.button" disabled="disabled" type="button" data-view-component="true" class="Button--secondary Button--medium Button">
            <span class="Button-content">
              <span class="Button-label">
                <span data-target="change-password.showPasswordSectionButtonText">
                  Change password
                </span>

                <span data-target="change-password.hidePasswordSectionButtonText" hidden>
                  Hide
                </span>
              </span>
            </span>
          </button>
        <!-- END vendor/gems/3.3.1/ruby/3.3.0/gems/primer_view_components-0.25.0/app/components/primer/beta/button.rb -->
        </div>
      </div><!-- END vendor/gems/3.3.1/ruby/3.3.0/gems/primer_view_components-0.25.0/app/components/primer/beta/subhead.rb -->

      <!-- Change Password -->
      <div data-target="change-password.changePasswordSection" hidden>
        <!-- '" --><!-- </textarea></xmp> --></option></form><form data-turbo="false" class="edit_user" id="change_password" aria-label="Change password" action="/account/password" accept-charset="UTF-8" method="post"><input type="hidden" name="_method" value="put" autocomplete="off" /><input type="hidden" name="authenticity_token" value="LarJ8edXIlvB3HOrGuVxuUMaWYeE6cpOKyrY5wbIQhpyxdBqFaWuX7A_GF6PE7ocMjVWar7qmf9YE1lwyTvS3g" />
          <input type="hidden" name="session_revoked" id="session_revoked" value="false" autocomplete="off" class="form-control" />
          <div class="form-group password-confirmation-form">
            <div class="mb-1"><label for="user_old_password">Old password</label></div>
            <input type="password" name="user[old_password]" id="user_old_password" required="required" autocomplete="current-password" class="form-control form-control" />
          </div>
          <password-strength
            minimum-character-count="7"
            passphrase-length="15"
            invalid-message="Password is invalid."
            error-class="color-fg-danger text-bold"
            pass-class="color-fg-success"
          >
            <div class="form-group password-confirmation-form">
              <div class="mb-1"><label for="user_new_password">New password</label></div>
                <auto-check src="/users/password">
                  <input type="password" name="user[password]" id="user_new_password" required="required" passwordrules="minlength: 15; allowed: unicode;" autocomplete="new-password" aria-describedby="password-req-note" class="form-control form-control" />
            <input type="hidden" value="" data-csrf="true" /></auto-check>        </div>
            <div class="form-group password-confirmation-form">
              <div class="mb-1"><label for="user_confirm_new_password">Confirm new password</label></div>
              <input type="password" name="user[password_confirmation]" id="user_confirm_new_password" required="required" autocomplete="new-password" class="form-control form-control" />
            </div>
            <p id="password-req-note" class="note">Make sure it&#39;s <span data-more-than-n-chars="">at least 15 characters</span> OR <span data-min-chars="">at least 7 characters</span> <span data-number-requirement="">including a number</span> <span data-letter-requirement="">and a lowercase letter</span>. <a class="Link--inTextBlock" href="https://docs.github.com/articles/creating-a-strong-password" aria-label="Learn more about strong passwords">Learn more</a>.</p>
          </password-strength>
          <input type="text" name="required_field_0aea" hidden="hidden" class="form-control" /><input type="hidden" name="timestamp" value="1717088814768" autocomplete="off" class="form-control" /><input type="hidden" name="timestamp_secret" value="5846e2d693d8dab4da92eb0b07e2062746119b962f3742b1ad88f1b96ebb7701" autocomplete="off" class="form-control" />
          <p>
            <!-- BEGIN vendor/gems/3.3.1/ruby/3.3.0/gems/primer_view_components-0.25.0/app/components/primer/button_component.rb -->  <button type="submit" data-view-component="true" class="btn mr-2">    Update password
          </button><!-- END vendor/gems/3.3.1/ruby/3.3.0/gems/primer_view_components-0.25.0/app/components/primer/button_component.rb -->
              <span><a href="/password_reset">I forgot my password</a></span>
            </p>
        </form>
      </div>

      <div data-target="change-password.changePasswordInformationSection" class="note">
        Strengthen your account by ensuring your password is strong.
        <a class="Link--inTextBlock" href="https://docs.github.com/authentication/keeping-your-account-and-data-secure/creating-a-strong-password">Learn more about creating a strong password</a>.
      </div>
    </change-password>
    `)
  })

  test('isConnected', () => {
    assert.isTrue(container.isConnected)
    assert.instanceOf(container, ChangePasswordElement)
  })

  test('change password button is not disabled on render', () => {
    assert.isFalse(container.button?.disabled)
  })

  test('shows and hides change password section', () => {
    // Shows the change password section
    container.toggleChangePasswordSection()

    assert.isFalse(container.changePasswordSection?.hidden)
    assert.isTrue(container.changePasswordInformationSection?.hidden)
    assert.isTrue(container.showPasswordSectionButtonText?.hidden)
    assert.isFalse(container.hidePasswordSectionButtonText?.hidden)

    // Hides the change password section
    container.toggleChangePasswordSection()

    assert.isTrue(container.changePasswordSection?.hidden)
    assert.isFalse(container.changePasswordInformationSection?.hidden)
    assert.isFalse(container.showPasswordSectionButtonText?.hidden)
    assert.isTrue(container.hidePasswordSectionButtonText?.hidden)
  })
})

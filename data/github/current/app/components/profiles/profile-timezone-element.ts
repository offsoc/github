import {controller, attr} from '@github/catalyst'

// When rendered, replace its content (a profile's timezone) with whether that
// timezone is ahead, behind or equal to the browser/OS seeing it.
//
// Receives the number of hours that the profile's timezone (selected on
// settings) is ahead of UTC (negative if behind, zero if on UTC). If not passed
// (e.g., user viewing their own profile), does not change its content.
//
// Tests can also pass a timezone offset to simulate a browser timezone
// (it will be used instead of new Date.getTimezoneOffset())
@controller
class ProfileTimezoneElement extends HTMLElement {
  @attr hoursAheadOfUtc: number
  @attr timezoneOffset: number

  connectedCallback() {
    this.#renderOutput()
  }

  #renderOutput = () => {
    if (!this.hoursAheadOfUtc) {
      return
    }
    if (!this.timezoneOffset) {
      this.timezoneOffset = new Date().getTimezoneOffset()
    }
    const browserHoursAheadOfUtc = -this.timezoneOffset / 60
    const hoursAhead = this.hoursAheadOfUtc - browserHoursAheadOfUtc

    switch (Math.sign(hoursAhead)) {
      case 1:
        this.textContent = `- ${this.#formatAs99h99m(hoursAhead)} ahead`
        break
      case -1:
        this.textContent = `- ${this.#formatAs99h99m(hoursAhead)} behind`
        break
      default:
        this.textContent = '- same time'
        break
    }
  }

  #formatAs99h99m = (hoursAsFloat: number) => {
    const hours = Math.floor(Math.abs(hoursAsFloat))
    const minutes = (Math.abs(hoursAsFloat) * 60) % 60

    const formattedHours = hours !== 0 ? `${hours}h` : ''
    const formattedMinutes = minutes !== 0 ? `${minutes}m` : ''

    return `${formattedHours}${formattedMinutes}`
  }
}

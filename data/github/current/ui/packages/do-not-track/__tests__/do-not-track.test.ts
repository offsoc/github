import {doNotTrack, gpcEnabled, gpcDisabled} from '../do-not-track'

test('doNotTrack is enabled', () => {
  window.doNotTrack = '1'
  window.navigator.msDoNotTrack = '1'
  expect(doNotTrack()).toBe(true)
})

test('doNotTrack is disabled', () => {
  window.doNotTrack = '0'
  window.navigator.msDoNotTrack = '0'
  expect(doNotTrack()).toBe(false)
})

test('globalPrivacyControl is enabled', () => {
  window.navigator.globalPrivacyControl = true
  expect(gpcEnabled()).toBe(true)
  expect(doNotTrack()).toBe(true)
})

test('globalPrivacyControl is disabled', () => {
  window.navigator.globalPrivacyControl = false
  expect(gpcDisabled()).toBe(true)
  expect(doNotTrack()).toBe(false)
})

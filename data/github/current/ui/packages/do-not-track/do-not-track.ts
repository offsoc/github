declare global {
  interface Window {
    doNotTrack: string
  }

  interface Navigator {
    globalPrivacyControl?: boolean
    msDoNotTrack: string
  }
}

function doNotTrackEnabled(): boolean {
  return (
    window.doNotTrack === '1' ||
    window.navigator.doNotTrack === '1' ||
    window.navigator.doNotTrack === 'yes' ||
    window.navigator.msDoNotTrack === '1'
  )
}

export function gpcEnabled(): boolean {
  return window.navigator.globalPrivacyControl === true
}

export function gpcDisabled(): boolean {
  return window.navigator.globalPrivacyControl === false || window.navigator.globalPrivacyControl === undefined
}

export function doNotTrack(): boolean {
  return doNotTrackEnabled() || gpcEnabled()
}

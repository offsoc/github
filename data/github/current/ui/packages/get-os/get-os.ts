import type {NavigatorUA} from './@types/user-agent-data'
import {ssrSafeWindow} from '@github-ui/ssr-utils'

export type NavigatorUserAgent = NavigatorUA

export const OS = {
  Android: 'Android',
  iOS: 'iOS',
  macOS: 'macOS',
  Windows: 'Windows',
  Linux: 'Linux',
  Unknown: 'Unknown',
}
export type OS = (typeof OS)[keyof typeof OS]

export type OSInformation = {
  os: OS
  isAndroid: boolean
  isIOS: boolean
  isLinux: boolean
  isMacOS: boolean
  isWindows: boolean
  isDesktop: boolean
  isMobile: boolean
}

export function getOS(): OSInformation {
  let os: OS = OS.Unknown
  let isMobileOS = false
  if (ssrSafeWindow) {
    // TypeScript doesn't 'know' about userAgentData yet
    const navigator = ssrSafeWindow.navigator as Navigator & NavigatorUA
    const userAgent = navigator.userAgent
    const platform = navigator?.userAgentData?.platform || navigator.platform
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'macOS']
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
    const iosPlatforms = ['iPhone', 'iPad', 'iPod']

    if (macosPlatforms.indexOf(platform) !== -1) {
      os = OS.macOS
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = OS.iOS
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = OS.Windows
    } else if (/Android/.test(userAgent)) {
      os = OS.Android
    } else if (/Linux/.test(platform)) {
      os = OS.Linux
    }
    isMobileOS = navigator?.userAgentData?.mobile ?? (os === OS.Android || os === OS.iOS)
  }

  return {
    os,
    isAndroid: os === OS.Android,
    isIOS: os === OS.iOS,
    isMacOS: os === OS.macOS,
    isWindows: os === OS.Windows,
    isLinux: os === OS.Linux,
    isDesktop: os === OS.macOS || os === OS.Windows || os === OS.Linux,
    isMobile: isMobileOS,
  }
}

export function isMobile(): boolean {
  return getOS().isMobile
}

export function isDesktop(): boolean {
  return getOS().isDesktop
}

export function isAndroid(): boolean {
  return getOS().isAndroid
}

export function isIOS(): boolean {
  return getOS().isIOS
}

export function isMacOS(): boolean {
  return getOS().isMacOS
}

export function isWindows(): boolean {
  return getOS().isWindows
}

export function isLinux(): boolean {
  return getOS().isLinux
}

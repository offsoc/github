let allowUserContentScrolling = true

export function setUserContentScrolling(setting: boolean) {
  allowUserContentScrolling = setting
}

export function getUserContentScrolling() {
  return allowUserContentScrolling
}

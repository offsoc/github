import {buildCodespacesPath} from '../components/CodespacesTab'

export const defaultRepoPolicyInfo = {
  allowed: true,
  canBill: true,
  hasIpAllowLists: false,
  disabledByBusiness: false,
  disabledByOrganization: false,
  changesWouldBeSafe: true,
}

export const testCodeButtonPayload = {
  local: {
    protocolInfo: {
      httpAvailable: true,
      sshAvailable: true,
      httpUrl: '/http',
      showCloneWarning: false,
      sshUrl: '/ssh',
      sshCertificatesRequired: false,
      sshCertificatesAvailable: true,
      ghCliUrl: '/gh-cli',
      defaultProtocol: 'http',
      newSshKeyUrl: '/ssh-key',
      setProtocolPath: '/set-protocol',
    },
    platformInfo: {
      cloneUrl: '/clone',
      visualStudioCloneUrl: '/vs-clone',
      xcodeCloneUrl: '/xcode-clone',
      zipballUrl: '/zip',
      showVisualStudioCloneButton: true,
      showXcodeCloneButton: true,
    },
    helpUrl: '/help',
  },
  copilot: {
    repoOwner: 'monalisa',
    repoName: 'test-repo',
    refName: 'main',
  },
  codespaces: {
    isLoggedIn: true,
    codespacesPath: buildCodespacesPath(1, 'main'),
    hasAccessToCodespaces: true,
    repoPolicyInfo: defaultRepoPolicyInfo,
    contactPath: '/contact',
    currentUserIsEnterpriseManaged: false,
    enterpriseManagedBusinessName: 'enterprise',
    newCodespacePath: '/new-codespace',
    isEnterprise: false,
    codespacesEnabled: true,
  },
}

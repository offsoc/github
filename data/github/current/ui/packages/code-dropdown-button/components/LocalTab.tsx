import {useCallback, useState} from 'react'
import {useIsPlatform} from '@github-ui/use-is-platform'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetch} from '@github-ui/verified-fetch'
import {ActionList, Box, Flash, Heading, Link, Octicon, Text, UnderlineNav} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {CopyToClipboardButton} from '@github-ui/copy-to-clipboard'
import {DesktopDownloadIcon, FileZipIcon, QuestionIcon, TerminalIcon} from '@primer/octicons-react'

export interface LocalTabProps {
  protocolInfo: {
    httpAvailable: boolean
    sshAvailable: boolean
    httpUrl: string
    showCloneWarning: boolean
    sshUrl: string
    sshCertificatesRequired: boolean
    sshCertificatesAvailable: boolean
    ghCliUrl: string
    defaultProtocol: string
    newSshKeyUrl: string
    setProtocolPath: string
  }
  platformInfo: {
    cloneUrl: string
    visualStudioCloneUrl: string
    xcodeCloneUrl: string
    zipballUrl: string
    showVisualStudioCloneButton: boolean
    showXcodeCloneButton: boolean
  }
  helpUrl: string
}

export function LocalTab(props: LocalTabProps) {
  const {
    httpAvailable,
    sshAvailable,
    httpUrl,
    showCloneWarning,
    sshUrl,
    sshCertificatesRequired,
    sshCertificatesAvailable,
    ghCliUrl,
    newSshKeyUrl,
    setProtocolPath,
  } = props.protocolInfo
  const {defaultProtocol} = props.protocolInfo
  const [activeLocalTab, setActiveLocalTab] = useState(defaultProtocol)
  const [openingPlatform, setOpeningPlatform] = useState('')

  const {cloneUrl, visualStudioCloneUrl, showVisualStudioCloneButton, showXcodeCloneButton, xcodeCloneUrl, zipballUrl} =
    props.platformInfo
  const isMacOrWindows = useIsPlatform(['windows', 'mac'])
  const isMac = useIsPlatform(['mac'])
  const navigate = useNavigate()

  const localListItemStyle = {
    borderTop: '1px solid',
    borderColor: 'var(--borderColor-muted, var(--color-border-muted))',
    p: 3,
    borderRadius: 0,
  }

  const localProtocolMessageStyle = {mt: 2, color: 'fg.muted'}

  const onProtocolTabClick = useCallback(
    (protocol: string) => {
      if (activeLocalTab !== protocol) {
        setActiveLocalTab(protocol)
        const formData = new FormData()
        formData.set('protocol_selector', protocol)
        verifiedFetch(setProtocolPath, {method: 'post', body: formData})
      }
    },
    [activeLocalTab, setActiveLocalTab, setProtocolPath],
  )

  return (
    <div>
      {openingPlatform === 'githubDesktop' ? (
        <LaunchingPlatformContents platform="GitHub Desktop" href="https://desktop.github.com/" />
      ) : openingPlatform === 'visualStudio' ? (
        <LaunchingPlatformContents platform="Visual Studio" />
      ) : openingPlatform === 'xcode' ? (
        <LaunchingPlatformContents platform="Xcode" href="https://developer.apple.com/xcode/" />
      ) : (
        <>
          <div className="m-3">
            <div className="d-flex flex-items-center">
              <Octicon icon={TerminalIcon} className="mr-2" />
              <p className="flex-1 text-bold mb-0">Clone</p>
              <Tooltip text="Which remote URL should I use?" type="label" direction="w">
                <Link muted href={`${props.helpUrl}/articles/which-remote-url-should-i-use`}>
                  <Octicon icon={QuestionIcon} className="mr-1" />
                </Link>
              </Tooltip>
            </div>
            <UnderlineNav sx={{border: 'none', my: 2, px: 0}} aria-label="Remote URL selector">
              {httpAvailable && (
                <UnderlineNav.Item
                  aria-current={activeLocalTab === 'http' ? 'page' : undefined}
                  className="text-bold"
                  onClick={ev => {
                    onProtocolTabClick('http')
                    ev.preventDefault()
                  }}
                >
                  HTTPS
                </UnderlineNav.Item>
              )}
              {sshAvailable && (
                <UnderlineNav.Item
                  aria-current={activeLocalTab === 'ssh' ? 'page' : undefined}
                  className="text-bold"
                  onClick={ev => {
                    onProtocolTabClick('ssh')
                    ev.preventDefault()
                  }}
                >
                  SSH
                </UnderlineNav.Item>
              )}
              <UnderlineNav.Item
                aria-current={activeLocalTab === 'gh_cli' ? 'page' : undefined}
                className="text-bold"
                onClick={ev => {
                  onProtocolTabClick('gh_cli')
                  ev.preventDefault()
                }}
              >
                GitHub CLI
              </UnderlineNav.Item>
            </UnderlineNav>
            <div className="d-flex flex-column">
              {activeLocalTab === 'http' ? (
                <>
                  <CloneUrl url={httpUrl} />
                  <Text sx={localProtocolMessageStyle}>Clone using the web URL.</Text>
                </>
              ) : activeLocalTab === 'ssh' ? (
                <>
                  {showCloneWarning && (
                    <Flash className="mb-2" variant="warning">
                      {"You don't have any public SSH keys in your GitHub account. "}
                      You can{' '}
                      <Link inline href={newSshKeyUrl}>
                        add a new public key
                      </Link>
                      , or try cloning this repository via HTTPS.
                    </Flash>
                  )}
                  <CloneUrl url={sshUrl} />
                  <Text sx={localProtocolMessageStyle}>
                    {sshCertificatesRequired
                      ? 'Use a password-protected SSH certificate.'
                      : sshCertificatesAvailable
                        ? 'Use a password-protected SSH key or certificate.'
                        : 'Use a password-protected SSH key.'}
                  </Text>
                </>
              ) : (
                <>
                  <CloneUrl url={ghCliUrl} />
                  <Text sx={localProtocolMessageStyle}>
                    Work fast with our official CLI.{' '}
                    <Link
                      inline
                      href="https://cli.github.com"
                      target="_blank"
                      aria-label="Learn more about the GitHub CLI"
                    >
                      Learn more
                    </Link>
                  </Text>
                </>
              )}
            </div>
          </div>
          <ActionList
            className="py-0"
            sx={{
              li: {
                mx: 0,
                width: '100%',
              },
            }}
          >
            {isMacOrWindows && (
              <ActionList.Item
                onSelect={() => {
                  setOpeningPlatform('githubDesktop')
                  // Perform the navigation in an onClick because ActionList.LinkItems
                  // close the overlay when clicked.
                  navigate(cloneUrl)
                }}
                sx={localListItemStyle}
              >
                <ActionList.LeadingVisual>
                  <DesktopDownloadIcon />
                </ActionList.LeadingVisual>
                Open with GitHub Desktop
              </ActionList.Item>
            )}
            {isMacOrWindows && showVisualStudioCloneButton && (
              <ActionList.Item
                onSelect={() => {
                  setOpeningPlatform('visualStudio')
                  navigate(visualStudioCloneUrl)
                }}
                sx={localListItemStyle}
              >
                Open with Visual Studio
              </ActionList.Item>
            )}
            {isMac && showXcodeCloneButton && (
              <ActionList.Item
                onSelect={() => {
                  setOpeningPlatform('xcode')
                  navigate(xcodeCloneUrl)
                }}
                sx={localListItemStyle}
              >
                Open with Xcode
              </ActionList.Item>
            )}
            <ActionList.LinkItem data-turbo="false" href={zipballUrl} sx={localListItemStyle} rel="nofollow">
              <ActionList.LeadingVisual>
                <FileZipIcon />
              </ActionList.LeadingVisual>
              Download ZIP
            </ActionList.LinkItem>
          </ActionList>
        </>
      )}
    </div>
  )
}

function LaunchingPlatformContents({platform, href}: {platform: string; href?: string}) {
  return (
    <Box className="p-3" sx={{width: '400px'}}>
      <Heading as="h4" className="mb-3 text-center">
        {`Launching ${platform}`}
      </Heading>
      {href && (
        <p className="mb-3">
          If nothing happens, <Link inline href={href}>{`download ${platform}`}</Link> and try again.
        </p>
      )}
    </Box>
  )
}

export function CloneUrl({url}: {url: string}) {
  return (
    <Box className="d-flex" sx={{height: '32px'}}>
      <input
        type="text"
        className="form-control input-monospace input-sm color-bg-subtle"
        data-autoselect
        value={url}
        aria-label={url}
        readOnly
        style={{flexGrow: 1}}
      />
      <CopyToClipboardButton
        className="ml-1 mr-0"
        sx={{width: '32px'}}
        textToCopy={url}
        ariaLabel="Copy url to clipboard"
        tooltipProps={{direction: 'nw'}}
      />
    </Box>
  )
}

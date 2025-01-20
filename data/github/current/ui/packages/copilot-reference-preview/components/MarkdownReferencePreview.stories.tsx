import type {SafeHTMLString} from '@github-ui/safe-html'
import type {Meta} from '@storybook/react'

import {MarkdownReferencePreview, type MarkdownReferencePreviewProps} from './MarkdownReferencePreview'

const meta = {
  title: 'Apps/Copilot/MarkdownReferencePreview',
  component: MarkdownReferencePreview,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof MarkdownReferencePreview>

export default meta

const details = {
  type: 'snippet',
  ref: 'refs/heads/main',
  repoID: 707375606,
  repoName: 'docs-cp4d-snapshot',
  repoOwner: 'github',
  url: 'https://github.com/github/docs-cp4d-snapshot/blob/7a43e2ace8ec61bd6a108ea74015de9962ac905a/content/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github.md#L93-L122',
  path: 'content/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github.md',
  commitOID: '7a43e2ace8ec61bd6a108ea74015de9962ac905a',
  languageName: 'Markdown',
  languageID: 222,
  title: 'Adding locally hosted code to GitHub',
  range: {
    start: 93,
    end: 122,
  },
  contents:
    '# Adding locally hosted code to GitHub\n\nIf your code is stored locally on your computer and is tracked by Git or not tracked by any version control system (VCS), you can import the code to GitHub using GitHub CLI or Git commands.\n\n## About adding existing source code to GitHub\n\nIf you have source code stored locally on your computer that is tracked by Git or not tracked by any version control system (VCS), you can add the code to GitHub by typing commands in a terminal. You can do this by typing Git commands directly, or by using GitHub CLI.\n\nGitHub CLI is an open source tool for using GitHub from your computer\'s command line. GitHub CLI can simplify the process of adding an existing project to GitHub using the command line. To learn more about GitHub CLI, see "[AUTOTITLE](/github-cli/github-cli/about-github-cli)."\n\n<div class="ghd-spotlight ghd-spotlight-note border rounded-1 my-3 p-3 f5 color-border-accent-emphasis color-bg-accent">\n\n**Note:** If you\'re most comfortable with a point-and-click user interface, consider adding your project with GitHub Desktop instead. For more information, see "[AUTOTITLE](/desktop/adding-and-cloning-repositories/adding-a-repository-from-your-local-computer-to-github-desktop)."\n\n</div>\n\nIf your source code is tracked by a different VCS, such as Mercurial, Subversion, or Team Foundation Version Control, you must convert the repository to Git before you can add the project to GitHub.\n\n- "[AUTOTITLE](/migrations/importing-source-code/using-the-command-line-to-import-source-code/importing-a-subversion-repository)"\n- "[AUTOTITLE](/migrations/importing-source-code/using-the-command-line-to-import-source-code/importing-a-mercurial-repository)"\n- "[AUTOTITLE](/migrations/importing-source-code/using-the-command-line-to-import-source-code/importing-a-team-foundation-version-control-repository)"\n\n<div class="ghd-spotlight ghd-spotlight-warning border rounded-1 my-3 p-3 f5 color-border-danger-emphasis color-bg-danger">\n\n**Warning:** Never `git add`, `commit`, or `push` sensitive information to a remote repository. Sensitive information can include, but is not limited to:\n\n- Passwords\n- SSH keys\n- [AWS access keys](http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSGettingStartedGuide/AWSCredentials.html)\n- API keys\n- Credit card numbers\n- PIN numbers\n\nFor more information, see "[AUTOTITLE](/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)."\n\n</div>\n\n## Initializing a Git repository\n\nIf your locally-hosted code isn\'t tracked by any VCS, the first step is to initialize a Git repository. If your project is already tracked by Git, skip to "[Importing a Git repository with the command line](#importing-a-git-repository-with-the-command-line)."\n\n1. Open <span class="platform-mac">Terminal</span><span class="platform-linux">Terminal</span><span class="platform-windows">Git Bash</span>.\n1. Navigate to the root directory of your project.\n1. Initialize the local directory as a Git repository. By default, the initial branch is called `main`.\n\n   If you’re using Git 2.28.0 or a later version, you can set the name of the default branch using `-b`.\n\n   ```shell\n   git init -b main\n   ```\n\n   If you’re using Git 2.27.1 or an earlier version, you can set the name of the default branch using  `git symbolic-ref`.\n\n   ``` shell\n   git init && git symbolic-ref HEAD refs/heads/main\n   ```\n\n1. Add the files in your new local repository. This stages them for the first commit.\n\n   ```shell\n   $ git add .\n   # Adds the files in the local repository and stages them for commit. To unstage a file, use \'git reset HEAD YOUR-FILE\'.\n   ```\n\n1. Commit the files that you\'ve staged in your local repository.\n\n   ```shell\n   $ git commit -m "First commit"\n   # Commits the tracked changes and prepares them to be pushed to a remote repository. To remove this commit and modify the file, use \'git reset --soft HEAD~1\' and commit and add the file again.\n   ```\n\n## Importing a Git repository with the command line\n\nAfter you\'ve initialized a Git repository, you can push the repository to GitHub, using either GitHub CLI or Git.\n\n- "[Adding a local repository to GitHub with GitHub CLI](#adding-a-local-repository-to-github-with-github-cli)"\n- "[Adding a local repository to GitHub using Git](#adding-a-local-repository-to-github-using-git)"\n\n### Adding a local repository to GitHub with GitHub CLI\n\n1. To create a repository for your project on GitHub, use the `gh repo create` subcommand. When prompted, select **Push an existing local repository to GitHub** and enter the desired name for your repository. If you want your project to belong to an organization instead of your user account, specify the organization name and project name with `organization-name/project-name`.\n\n1. Follow the interactive prompts. To add the remote and push the repository, confirm yes when asked to add the remote and push the commits to the current branch.\n\n1. Alternatively, to skip all the prompts, supply the path to the repository with the `--source` flag and pass a visibility flag (`--public`, `--private`, or `--internal`). For example, `gh repo create --source=. --public`. Specify a remote with the `--remote` flag. To push your commits, pass the `--push` flag. For more information about possible arguments, see the [GitHub CLI manual](https://cli.github.com/manual/gh_repo_create).\n\n### Adding a local repository to GitHub using Git\n\n<div class="ghd-tool mac">\n\n1. Create a new repository on GitHub.com. To avoid errors, do not initialize the new repository with README, license, or gitignore files. You can add these files after your project has been pushed to GitHub. For more information, see "[AUTOTITLE](/repositories/creating-and-managing-repositories/creating-a-new-repository)."\n1. At the top of your repository on GitHub.com\'s Quick Setup page, click <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-copy" aria-label="Copy to clipboard" role="img"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg> to copy the remote repository URL.\n\n   ![Screenshot of the "Quick Setup" header in a repository. Next to the remote URL, an icon of two overlapping squares is highlighted with an orange outline.](/assets/images/help/repository/copy-remote-repository-url-quick-setup.png)\n\n1. Open <span class="platform-mac">Terminal</span><span class="platform-linux">Terminal</span><span class="platform-windows">Git Bash</span>.\n1. Change the current working directory to your local project.\n1. To add the URL for the remote repository where your local repository will be pushed, run the following command. Replace `REMOTE-URL` with the repository\'s full URL on GitHub.\n\n   ```shell\n   git remote add origin REMOTE-URL\n   ```\n\n   For more information, see "[AUTOTITLE](/get-started/getting-started-with-git/managing-remote-repositories)."\n1. To verify that you set the remote URL correctly, run the following command.\n\n   ```shell\n   git remote -v\n   ```\n\n1. To push the changes in your local repository to GitHub.com, run the following command.\n\n   ```shell\n   git push -u origin main\n   ```\n\n</div>\n\n<div class="ghd-tool windows">\n\n1. Create a new repository on GitHub.com. To avoid errors, do not initialize the new repository with README, license, or gitignore files. You can add these files after your project has been pushed to GitHub. For more information, see "[AUTOTITLE](/repositories/creating-and-managing-repositories/creating-a-new-repository)."\n1. At the top of your repository on GitHub.com\'s Quick Setup page, click <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-copy" aria-label="Copy to clipboard" role="img"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg> to copy the remote repository URL.\n\n   ![Screenshot of the "Quick Setup" header in a repository. Next to the remote URL, an icon of two overlapping squares is highlighted with an orange outline.](/assets/images/help/repository/copy-remote-repository-url-quick-setup.png)\n1. Open <span class="platform-mac">Terminal</span><span class="platform-linux">Terminal</span><span class="platform-windows">Git Bash</span>.\n1. Change the current working directory to your local project.\n1. To add the URL for the remote repository where your local repository will be pushed, run the following command. Replace `REMOTE-URL` with the repository\'s full URL on GitHub.\n\n   ```shell\n   git remote add origin REMOTE-URL\n   ```\n\n   For more information, see "[AUTOTITLE](/get-started/getting-started-with-git/managing-remote-repositories)."\n1. To verify that you set the remote URL correctly, run the following command.\n\n   ```shell\n   git remote -v\n   ```\n\n1. To push the changes in your local repository to GitHub.com, run the following command.\n\n   ```shell\n   git push origin main\n   ```\n\n</div>\n\n<div class="ghd-tool linux">\n\n1. Create a new repository on GitHub.com. To avoid errors, do not initialize the new repository with README, license, or gitignore files. You can add these files after your project has been pushed to GitHub. For more information, see "[AUTOTITLE](/repositories/creating-and-managing-repositories/creating-a-new-repository)."\n1. At the top of your repository on GitHub.com\'s Quick Setup page, click <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-copy" aria-label="Copy to clipboard" role="img"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg> to copy the remote repository URL.\n\n   ![Screenshot of the "Quick Setup" header in a repository. Next to the remote URL, an icon of two overlapping squares is highlighted with an orange outline.](/assets/images/help/repository/copy-remote-repository-url-quick-setup.png)\n1. Open <span class="platform-mac">Terminal</span><span class="platform-linux">Terminal</span><span class="platform-windows">Git Bash</span>.\n1. Change the current working directory to your local project.\n1. To add the URL for the remote repository where your local repository will be pushed, run the following command. Replace `REMOTE-URL` with the repository\'s full URL on GitHub.\n\n   ```shell\n   git remote add origin REMOTE-URL\n   ```\n\n   For more information, see "[AUTOTITLE](/get-started/getting-started-with-git/managing-remote-repositories)."\n1. To verify that you set the remote URL correctly, run the following command.\n\n   ```shell\n   git remote -v\n   ```\n\n1. To push the changes in your local repository to GitHub.com, run the following command.\n\n   ```shell\n   git push origin main\n   ```\n\n</div>\n\n## Further reading\n\n- "[AUTOTITLE](/repositories/working-with-files/managing-files/adding-a-file-to-a-repository#adding-a-file-to-a-repository-using-the-command-line)"\n- "[AUTOTITLE](/get-started/using-git/troubleshooting-the-2-gb-push-limit)"',
  heading: 'Adding a local repository to GitHub using Git',
  score: 149.27245,
  n: 3,
  repoIsOrgOwned: true,
  highlightedContents: [] as SafeHTMLString[], // elided because it's not used
  expandedRange: {
    start: 1,
    end: 180,
  },
  headerInfo: {
    blobSize: '15.5 KB',
    displayName: 'blackbird.ts',
    isLfs: false,
    lineInfo: {
      truncatedLoc: 100,
      truncatedSloc: 90,
    },
    rawBlobUrl:
      'http://raw.github.localhost/github/blackbird-parser/refs/heads/main/src/blackbird.ts?token=THISISNOTATOKEN',
    viewable: true,
  },
} as const

const reference = {
  type: 'snippet',
  ref: 'refs/heads/main',
  repoID: 707375606,
  repoName: 'docs-cp4d-snapshot',
  repoOwner: 'github',
  url: 'https://github.com/github/docs-cp4d-snapshot/blob/7a43e2ace8ec61bd6a108ea74015de9962ac905a/content/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github.md#L93-L122',
  path: 'content/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github.md',
  commitOID: '7a43e2ace8ec61bd6a108ea74015de9962ac905a',
  languageName: 'Markdown',
  languageID: 222,
  title: 'Adding locally hosted code to GitHub',
  range: {
    start: 93,
    end: 122,
  },
  contents:
    '\n   ![Screenshot of the "Quick Setup" header in a repository. Next to the remote URL, an icon of two overlapping squares is highlighted with an orange outline.](/assets/images/help/repository/copy-remote-repository-url-quick-setup.png)\n\n1. Open <span class="platform-mac">Terminal</span><span class="platform-linux">Terminal</span><span class="platform-windows">Git Bash</span>.\n1. Change the current working directory to your local project.\n1. To add the URL for the remote repository where your local repository will be pushed, run the following command. Replace `REMOTE-URL` with the repository\'s full URL on GitHub.\n\n   ```shell\n   git remote add origin REMOTE-URL\n   ```\n\n   For more information, see "[AUTOTITLE](/get-started/getting-started-with-git/managing-remote-repositories)."\n1. To verify that you set the remote URL correctly, run the following command.\n\n   ```shell\n   git remote -v\n   ```\n\n1. To push the changes in your local repository to GitHub.com, run the following command.\n\n   ```shell\n   git push -u origin main\n   ```\n\n</div>\n\n<div class="ghd-tool windows">\n\n1. Create a new repository on GitHub.com. To avoid errors, do not initialize the new repository with README, license, or gitignore files. You can add these files after your project has been pushed to GitHub. For more information, see "[AUTOTITLE](/repositories/creating-and-managing-repositories/creating-a-new-repository)."\n1. At the top of your repository on GitHub.com\'s Quick Setup page, click <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-copy" aria-label="Copy to clipboard" role="img"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg> to copy the remote repository URL.',
  heading: 'Adding a local repository to GitHub using Git',
  score: 149.27245,
  n: 3,
} as const

const defaultArgs: MarkdownReferencePreviewProps = {
  details,
  detailsLoading: false,
  detailsError: false,
  reference,
}

export const MarkdownReferencePreviewExample = {
  args: {
    ...defaultArgs,
  },
  render: (props: MarkdownReferencePreviewProps) => {
    return <MarkdownReferencePreview {...props} />
  },
}

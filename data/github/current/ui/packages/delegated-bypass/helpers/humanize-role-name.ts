export function humanizeRoleName(currentActor: {actorType: string; name: string}) {
  if (currentActor.actorType === 'RepositoryRole') {
    switch (currentActor.name) {
      case 'admin':
        return 'Repository admin'
      case 'maintain':
        return 'Maintain'
      case 'write':
        return 'Write'
      default:
        return currentActor.name
    }
  }
  return currentActor.name
}

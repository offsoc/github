/**
 * @file Utilities to be used in meta-components that render documentation and information about commands. Should not
 * typically be used in most applications.
 */

export {getCommandMetadata, getServiceMetadata} from './commands'
export {getAllRegisteredCommands, type UICommand, type UICommandGroup, type UIService} from './commands-registry'

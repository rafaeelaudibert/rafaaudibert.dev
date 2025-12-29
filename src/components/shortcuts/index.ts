// Main exports for shortcuts system
export { ShortcutsManager } from "./ShortcutsManager"
export { ShortcutsHelpDialog } from "./ShortcutsHelpDialog"
export {
  ShortcutsProvider,
  useShortcuts,
  useShortcut,
  useShortcutsRegistration,
} from "./ShortcutsContext"

// Re-export types and utilities from the registry
export {
  shortcutsRegistry,
  isMac,
  getAltKeyName,
  type Shortcut,
} from "../../utils/shortcuts"

/**
 * Global Keyboard Shortcuts Registry
 *
 * This module provides a centralized way to register and manage keyboard shortcuts.
 * Components can register their shortcuts and the system will handle:
 * - Executing actions when shortcuts are pressed
 * - Showing/hiding hint indicators when Alt is held
 * - Platform-specific key display (Cmd vs Ctrl)
 */

export interface Shortcut {
  /** Unique identifier for this shortcut */
  id: string
  /** The key to press (single character, case-insensitive) */
  key: string
  /** Human-readable description */
  description: string
  /** Action to execute when triggered */
  action: () => void
  /** Whether this shortcut requires Alt to be held (default: true) */
  requiresAlt?: boolean
  /** Optional group for organizing shortcuts */
  group?: "navigation" | "actions" | "other"
}

type ShortcutListener = (shortcuts: Map<string, Shortcut>) => void
type AltKeyListener = (isAltPressed: boolean) => void

class ShortcutsRegistry {
  private shortcuts: Map<string, Shortcut> = new Map()
  private shortcutListeners: Set<ShortcutListener> = new Set()
  private altKeyListeners: Set<AltKeyListener> = new Set()
  private isAltPressed = false
  private isInitialized = false

  /**
   * Initialize the global keyboard event listeners.
   * Should be called once when the app loads.
   */
  init() {
    if (this.isInitialized || typeof window === "undefined") return
    this.isInitialized = true

    document.addEventListener("keydown", this.handleKeyDown)
    document.addEventListener("keyup", this.handleKeyUp)

    // Handle window blur to reset Alt state
    window.addEventListener("blur", this.handleBlur)
  }

  /**
   * Clean up event listeners.
   * Should be called when the app unmounts.
   */
  destroy() {
    if (!this.isInitialized || typeof window === "undefined") return
    this.isInitialized = false

    document.removeEventListener("keydown", this.handleKeyDown)
    document.removeEventListener("keyup", this.handleKeyUp)
    window.removeEventListener("blur", this.handleBlur)
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Update Alt state
    if (e.key === "Alt") {
      // Prevent default Alt behavior (menu focus in some browsers)
      e.preventDefault()
      this.setAltPressed(true)
      return
    }

    // Check if we should trigger a shortcut
    if (!this.isAltPressed) return

    // Don't trigger if user is typing in an input
    const target = e.target as HTMLElement
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return
    }

    const key = e.key.toLowerCase()
    const shortcut = this.findShortcutByKey(key)

    if (shortcut) {
      e.preventDefault()
      shortcut.action()

      // Reset Alt state after triggering
      this.setAltPressed(false)
    }
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Alt") {
      this.setAltPressed(false)
    }
  }

  private handleBlur = () => {
    // Reset Alt state when window loses focus
    this.setAltPressed(false)
  }

  private setAltPressed(pressed: boolean) {
    if (this.isAltPressed === pressed) return
    this.isAltPressed = pressed
    this.altKeyListeners.forEach((listener) => listener(pressed))
  }

  private findShortcutByKey(key: string): Shortcut | undefined {
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.key.toLowerCase() === key) {
        return shortcut
      }
    }
    return undefined
  }

  /**
   * Register a new shortcut.
   * Returns an unregister function.
   */
  register(shortcut: Shortcut): () => void {
    this.shortcuts.set(shortcut.id, {
      requiresAlt: true,
      group: "other",
      ...shortcut,
    })
    this.notifyShortcutListeners()

    return () => this.unregister(shortcut.id)
  }

  /**
   * Register multiple shortcuts at once.
   * Returns an unregister function that removes all of them.
   */
  registerMany(shortcuts: Shortcut[]): () => void {
    const unregisters = shortcuts.map((s) => this.register(s))
    return () => unregisters.forEach((unregister) => unregister())
  }

  /**
   * Unregister a shortcut by ID.
   */
  unregister(id: string) {
    this.shortcuts.delete(id)
    this.notifyShortcutListeners()
  }

  /**
   * Get all registered shortcuts.
   */
  getAll(): Map<string, Shortcut> {
    return new Map(this.shortcuts)
  }

  /**
   * Get a shortcut by its key.
   */
  getByKey(key: string): Shortcut | undefined {
    return this.findShortcutByKey(key)
  }

  /**
   * Subscribe to shortcut changes.
   */
  onShortcutsChange(listener: ShortcutListener): () => void {
    this.shortcutListeners.add(listener)
    // Immediately call with current state
    listener(this.getAll())
    return () => this.shortcutListeners.delete(listener)
  }

  /**
   * Subscribe to Alt key state changes.
   */
  onAltKeyChange(listener: AltKeyListener): () => void {
    this.altKeyListeners.add(listener)
    // Immediately call with current state
    listener(this.isAltPressed)
    return () => this.altKeyListeners.delete(listener)
  }

  private notifyShortcutListeners() {
    const shortcuts = this.getAll()
    this.shortcutListeners.forEach((listener) => listener(shortcuts))
  }

  /**
   * Check if Alt is currently pressed.
   */
  getAltPressed(): boolean {
    return this.isAltPressed
  }
}

// Singleton instance
export const shortcutsRegistry = new ShortcutsRegistry()

// Helper to detect platform
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false
  return (
    navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
    navigator.userAgent.toUpperCase().indexOf("MAC") >= 0
  )
}

// Get platform-specific modifier key name
export function getAltKeyName(): string {
  return isMac() ? "⌥" : "Alt"
}


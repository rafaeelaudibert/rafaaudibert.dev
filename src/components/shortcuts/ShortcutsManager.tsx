import { useEffect, useMemo, useState, useCallback } from "react"
import { ShortcutsProvider, useShortcutsRegistration } from "./ShortcutsContext"
import { shortcutsRegistry, type Shortcut } from "../../utils/shortcuts"
import { ShortcutsHelpDialog } from "./ShortcutsHelpDialog"

interface NavigationShortcut {
  key: string
  label: string
  href: string
  external?: boolean
}

interface ShortcutsManagerInnerProps {
  navigationShortcuts: NavigationShortcut[]
}

function ShortcutsManagerInner({
  navigationShortcuts,
}: ShortcutsManagerInnerProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const closeHelp = useCallback(() => setIsHelpOpen(false), [])

  // Convert navigation shortcuts to registry format
  const shortcuts: Shortcut[] = useMemo(
    () =>
      navigationShortcuts.map((nav) => ({
        id: `nav-${nav.key}`,
        key: nav.key,
        description: `Go to ${nav.label}`,
        group: "navigation" as const,
        action: () => {
          if (nav.external) {
            window.open(nav.href, "_blank", "noopener,noreferrer")
          } else {
            window.location.href = nav.href
          }
        },
      })),
    [navigationShortcuts]
  )

  // Register all navigation shortcuts
  useShortcutsRegistration(shortcuts)

  // Register the ? shortcut to show help (without Alt)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      // ? key (with or without shift, for different keyboard layouts)
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault()
        setIsHelpOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Add global CSS class when Alt is pressed (for Astro components)
  useEffect(() => {
    const unsubscribe = shortcutsRegistry.onAltKeyChange((isAltPressed) => {
      document.documentElement.classList.toggle(
        "shortcuts-active",
        isAltPressed
      )
    })
    return unsubscribe
  }, [])

  return <ShortcutsHelpDialog isOpen={isHelpOpen} onClose={closeHelp} />
}

interface ShortcutsManagerProps {
  navigationShortcuts?: NavigationShortcut[]
}

/**
 * Main shortcuts manager component.
 * Mount this once in your layout to enable keyboard shortcuts.
 *
 * Features:
 * - Alt + key: Navigate to pages
 * - ?: Toggle shortcuts help dialog
 *
 * @example
 * ```tsx
 * <ShortcutsManager
 *   client:load
 *   navigationShortcuts={[
 *     { key: "h", label: "Home", href: "/" },
 *     { key: "b", label: "Blog", href: "/blog/" },
 *   ]}
 * />
 * ```
 */
export function ShortcutsManager({
  navigationShortcuts = [],
}: ShortcutsManagerProps) {
  return (
    <ShortcutsProvider>
      <ShortcutsManagerInner navigationShortcuts={navigationShortcuts} />
    </ShortcutsProvider>
  )
}

export default ShortcutsManager

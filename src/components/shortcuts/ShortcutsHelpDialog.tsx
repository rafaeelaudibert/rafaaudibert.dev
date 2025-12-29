import { useEffect, useRef, useCallback } from "react"
import { useShortcuts } from "./ShortcutsContext"
import { getAltKeyName, type Shortcut } from "../../utils/shortcuts"
import styles from "./ShortcutsHelpDialog.module.css"

interface ShortcutsHelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * A modal dialog that displays all registered keyboard shortcuts.
 * Accessible with proper focus management and keyboard navigation.
 */
export function ShortcutsHelpDialog({ isOpen, onClose }: ShortcutsHelpDialogProps) {
  const { shortcuts } = useShortcuts()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const altKey = getAltKeyName()

  // Group shortcuts by category
  const groupedShortcuts = groupShortcutsByCategory(shortcuts)

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  // Handle escape key and backdrop click
  const handleDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      // Close on backdrop click
      if (e.target === dialogRef.current) {
        onClose()
      }
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClick={handleDialogClick}
      onKeyDown={handleKeyDown}
      aria-labelledby="shortcuts-dialog-title"
    >
      <div className={styles.content}>
        <header className={styles.header}>
          <h2 id="shortcuts-dialog-title" className={styles.title}>
            Keyboard Shortcuts
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close shortcuts dialog"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <p className={styles.instruction}>
          Hold <kbd className={styles.kbd}>{altKey}</kbd> and press a key to
          navigate. Hints appear next to links when {altKey} is held.
        </p>

        <div className={styles.groups}>
          {groupedShortcuts.map(({ group, shortcuts }) => (
            <section key={group} className={styles.group}>
              <h3 className={styles.groupTitle}>{formatGroupName(group)}</h3>
              <ul className={styles.shortcutList}>
                {shortcuts.map((shortcut) => (
                  <li key={shortcut.id}>
                    <button
                      className={styles.shortcutItem}
                      onClick={() => {
                        onClose()
                        shortcut.action()
                      }}
                      type="button"
                    >
                      <span className={styles.shortcutDescription}>
                        {shortcut.description}
                      </span>
                      <span className={styles.shortcutKeys}>
                        <kbd className={styles.kbd}>{altKey}</kbd>
                        <span className={styles.plus}>+</span>
                        <kbd className={styles.kbd}>
                          {shortcut.key.toUpperCase()}
                        </kbd>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className={styles.footer}>
          <p>
            Press <kbd className={styles.kbd}>?</kbd> anytime to show this help
          </p>
        </footer>
      </div>
    </dialog>
  )
}

interface GroupedShortcuts {
  group: string
  shortcuts: Shortcut[]
}

function groupShortcutsByCategory(
  shortcuts: Map<string, Shortcut>
): GroupedShortcuts[] {
  const groups = new Map<string, Shortcut[]>()

  for (const shortcut of shortcuts.values()) {
    const group = shortcut.group || "other"
    const existing = groups.get(group) || []
    existing.push(shortcut)
    groups.set(group, existing)
  }

  // Sort groups: navigation first, then actions, then other
  const order = ["navigation", "actions", "other"]
  const result: GroupedShortcuts[] = []

  for (const group of order) {
    const shortcuts = groups.get(group)
    if (shortcuts && shortcuts.length > 0) {
      // Sort shortcuts within group by key
      shortcuts.sort((a, b) => a.key.localeCompare(b.key))
      result.push({ group, shortcuts })
    }
  }

  return result
}

function formatGroupName(group: string): string {
  switch (group) {
    case "navigation":
      return "Navigation"
    case "actions":
      return "Actions"
    case "other":
      return "Other"
    default:
      return group.charAt(0).toUpperCase() + group.slice(1)
  }
}


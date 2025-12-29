import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  shortcutsRegistry,
  type Shortcut,
} from "../../utils/shortcuts"

interface ShortcutsContextValue {
  /** Whether the Alt key is currently pressed */
  isAltPressed: boolean
  /** All registered shortcuts */
  shortcuts: Map<string, Shortcut>
  /** Register a new shortcut */
  register: (shortcut: Shortcut) => () => void
  /** Register multiple shortcuts */
  registerMany: (shortcuts: Shortcut[]) => () => void
  /** Get a shortcut by its key */
  getByKey: (key: string) => Shortcut | undefined
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null)

interface ShortcutsProviderProps {
  children: ReactNode
}

export function ShortcutsProvider({ children }: ShortcutsProviderProps) {
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [shortcuts, setShortcuts] = useState<Map<string, Shortcut>>(new Map())

  useEffect(() => {
    // Initialize the registry
    shortcutsRegistry.init()

    // Subscribe to changes
    const unsubAlt = shortcutsRegistry.onAltKeyChange(setIsAltPressed)
    const unsubShortcuts = shortcutsRegistry.onShortcutsChange(setShortcuts)

    return () => {
      unsubAlt()
      unsubShortcuts()
    }
  }, [])

  const register = useCallback((shortcut: Shortcut) => {
    return shortcutsRegistry.register(shortcut)
  }, [])

  const registerMany = useCallback((shortcuts: Shortcut[]) => {
    return shortcutsRegistry.registerMany(shortcuts)
  }, [])

  const getByKey = useCallback((key: string) => {
    return shortcutsRegistry.getByKey(key)
  }, [])

  const value = useMemo(
    () => ({
      isAltPressed,
      shortcuts,
      register,
      registerMany,
      getByKey,
    }),
    [isAltPressed, shortcuts, register, registerMany, getByKey]
  )

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
    </ShortcutsContext.Provider>
  )
}

export function useShortcuts(): ShortcutsContextValue {
  const context = useContext(ShortcutsContext)
  if (!context) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider")
  }
  return context
}

/**
 * Hook to register a shortcut on mount and unregister on unmount.
 */
export function useShortcut(shortcut: Shortcut) {
  const { register } = useShortcuts()

  useEffect(() => {
    return register(shortcut)
  }, [register, shortcut.id, shortcut.key])
}

/**
 * Hook to register multiple shortcuts on mount.
 */
export function useShortcutsRegistration(shortcuts: Shortcut[]) {
  const { registerMany } = useShortcuts()

  useEffect(() => {
    return registerMany(shortcuts)
  }, [registerMany, shortcuts])
}


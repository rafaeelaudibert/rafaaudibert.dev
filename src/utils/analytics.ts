declare global {
  interface Window {
    posthog?: { capture: (event: string, properties?: Record<string, unknown>) => void }
  }
}

export function capture(event: string, properties?: Record<string, unknown>) {
  window.posthog?.capture(event, properties)
}

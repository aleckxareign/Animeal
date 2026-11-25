// TypeScript definitions for Google Identity Services (GIS)

export interface GoogleCredentialResponse {
  credential: string
  select_by?: string
  clientId?: string
}

export interface GoogleInitializeConfig {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  nonce?: string
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  context?: 'signin' | 'signup' | 'use'
  ux_mode?: 'popup' | 'redirect'
  allowed_parent_origin?: string | string[]
  intermediate_iframe_close_callback?: () => void
}

export interface GoogleRenderButtonOptions {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number | string
  locale?: string
}

export interface GoogleNotificationMoment {
  isNotDisplayed: () => boolean
  getNotDisplayedReason: () => string
  isSkippedMoment: () => boolean
  getSkippedReason: () => string
  isDismissedMoment: () => boolean
  getDismissedReason: () => string
  getMomentType: () => string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitializeConfig) => void
          renderButton: (parent: HTMLElement, options: GoogleRenderButtonOptions) => void
          prompt: (momentListener?: (notification: GoogleNotificationMoment) => void) => void
          cancel: () => void
          disableAutoSelect: () => void
          revoke: (hint: string, done: (resp: { successful: boolean; error?: string }) => void) => void
        }
      }
    }
  }
}

export {}

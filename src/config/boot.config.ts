/**
 * Boot Configuration
 *
 * This file contains different boot sequence configurations.
 * You can easily switch between different boot experiences by changing
 * the exported configuration.
 */

import { IProcess } from "../process/IProcess";
import { SplashScreen } from "../process/SplashScreen";
import { SystemCheck } from "../process/SystemCheck";
import { WelcomeMessage } from "../process/WelcomeMessage";

export interface BootConfig {
  name: string;
  description: string;
  programs: Array<() => IProcess>;
}

/**
 * No boot programs - start shell immediately
 */
export const QUICK_BOOT: BootConfig = {
  name: "Quick Boot",
  description: "Start shell immediately without boot sequence",
  programs: [],
};

/**
 * Minimal boot - just show splash screen
 */
export const MINIMAL_BOOT: BootConfig = {
  name: "Minimal Boot",
  description: "Show splash screen only",
  programs: [() => new SplashScreen()],
};

/**
 * Standard boot - splash + welcome message
 */
export const STANDARD_BOOT: BootConfig = {
  name: "Standard Boot",
  description: "Splash screen and welcome message",
  programs: [() => new SplashScreen(), () => new WelcomeMessage()],
};

/**
 * Full boot - complete initialization sequence
 */
export const FULL_BOOT: BootConfig = {
  name: "Full Boot",
  description: "Complete boot sequence with system checks",
  programs: [
    () => new SplashScreen(),
    () => new SystemCheck(),
    () => new WelcomeMessage(),
  ],
};

/**
 * Development boot - system checks only (for debugging)
 */
export const DEV_BOOT: BootConfig = {
  name: "Development Boot",
  description: "System checks only for development",
  programs: [() => new SystemCheck()],
};

// ============================================================================
// ACTIVE CONFIGURATION
// Change this to switch between boot modes
// ============================================================================

export const ACTIVE_BOOT_CONFIG = FULL_BOOT;

// Quick switch options (uncomment the one you want):
// export const ACTIVE_BOOT_CONFIG = QUICK_BOOT;      // No boot sequence
// export const ACTIVE_BOOT_CONFIG = MINIMAL_BOOT;    // Splash only
// export const ACTIVE_BOOT_CONFIG = STANDARD_BOOT;   // Splash + Welcome
// export const ACTIVE_BOOT_CONFIG = FULL_BOOT;       // Full sequence
// export const ACTIVE_BOOT_CONFIG = DEV_BOOT;        // System checks only

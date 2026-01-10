/**
 * InitFactory - Factory for creating different Init process configurations
 * Provides pre-configured Init processes for different use cases
 */

import { InitProcess } from "./InitProcess";
import { ShellProcess } from "./ShellProcess";
import { SplashScreen } from "./SplashScreen";
import { SystemCheck } from "./SystemCheck";
import { WelcomeMessage } from "./WelcomeMessage";
import { IProcess } from "./IProcess";

export type ShellConfigurator = (shell: ShellProcess) => void;

export interface InitFactoryOptions {
  bootPrograms?: Array<() => IProcess>;
  shellConfigurator?: ShellConfigurator;
}

/**
 * Factory class for creating Init processes
 */
export class InitFactory {
  /**
   * Create a custom Init process with specified boot programs
   */
  static create(options: InitFactoryOptions = {}): InitProcess {
    const init = new InitProcess(options.shellConfigurator);

    if (options.bootPrograms) {
      for (const programFactory of options.bootPrograms) {
        init.addBootProgram(programFactory);
      }
    }

    return init;
  }

  /**
   * Create Init with no boot programs - starts shell immediately
   */
  static quick(shellConfigurator?: ShellConfigurator): InitProcess {
    return new InitProcess(shellConfigurator);
  }

  /**
   * Create Init with splash screen only
   */
  static minimal(shellConfigurator?: ShellConfigurator): InitProcess {
    const init = new InitProcess(shellConfigurator);
    init.addBootProgram(() => new SplashScreen());
    return init;
  }

  /**
   * Create Init with standard boot sequence (splash + welcome)
   */
  static standard(shellConfigurator?: ShellConfigurator): InitProcess {
    const init = new InitProcess(shellConfigurator);
    init.addBootProgram(() => new SplashScreen());
    init.addBootProgram(() => new WelcomeMessage());
    return init;
  }

  /**
   * Create Init with full boot sequence (splash + system check + welcome)
   */
  static full(shellConfigurator?: ShellConfigurator): InitProcess {
    const init = new InitProcess(shellConfigurator);
    init.addBootProgram(() => new SplashScreen());
    init.addBootProgram(() => new SystemCheck());
    init.addBootProgram(() => new WelcomeMessage());
    return init;
  }

  /**
   * Create Init for development (system checks only)
   */
  static dev(shellConfigurator?: ShellConfigurator): InitProcess {
    const init = new InitProcess(shellConfigurator);
    init.addBootProgram(() => new SystemCheck());
    return init;
  }

  /**
   * Create Init with custom boot program sequence
   */
  static custom(
    bootPrograms: Array<() => IProcess>,
    shellConfigurator?: ShellConfigurator,
  ): InitProcess {
    const init = new InitProcess(shellConfigurator);

    for (const programFactory of bootPrograms) {
      init.addBootProgram(programFactory);
    }

    return init;
  }

  /**
   * Create Init from boot configuration
   */
  static fromConfig(
    config: {
      name: string;
      description: string;
      programs: Array<() => IProcess>;
    },
    shellConfigurator?: ShellConfigurator,
  ): InitProcess {
    const init = new InitProcess(shellConfigurator);

    for (const programFactory of config.programs) {
      init.addBootProgram(programFactory);
    }

    return init;
  }
}

/**
 * Convenience exports for common Init configurations
 */
export const createQuickInit = InitFactory.quick;
export const createMinimalInit = InitFactory.minimal;
export const createStandardInit = InitFactory.standard;
export const createFullInit = InitFactory.full;
export const createDevInit = InitFactory.dev;
export const createCustomInit = InitFactory.custom;

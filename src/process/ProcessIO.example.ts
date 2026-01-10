/**
 * ProcessIO Usage Examples
 *
 * This file demonstrates how to use the new Stream-based ProcessIO
 * for implementing Unix-like process communication.
 */

import { createProcessIO, ProcessIO, ProcessContext } from "./IProcess";
import { Stream } from "../utils/stream";

// ============================================================================
// Example 1: Simple Command Output
// ============================================================================

function example1_SimpleOutput() {
  console.log("=== Example 1: Simple Command Output ===");

  const io = createProcessIO();

  // Listen to stdout
  (io.stdout as Stream).onData((chunk) => {
    console.log(`[OUTPUT]: ${chunk}`);
  });

  // Process writes to stdout
  io.stdout.write("Hello, World!\n");
  io.stdout.write("Process completed successfully.\n");
}

// ============================================================================
// Example 2: Reading from stdin
// ============================================================================

function example2_ReadingInput() {
  console.log("\n=== Example 2: Reading from stdin ===");

  const io = createProcessIO();

  // Process reads from stdin
  io.stdin.onData((input) => {
    console.log(`[STDIN]: Received: ${input}`);
    io.stdout.write(`Echo: ${input}\n`);
  });

  // Simulate user input
  (io.stdin as Stream).write("Hello from user");
  (io.stdin as Stream).write("Another input");
}

// ============================================================================
// Example 3: Error Handling with stderr
// ============================================================================

function example3_ErrorHandling() {
  console.log("\n=== Example 3: Error Handling with stderr ===");

  const io = createProcessIO();

  // Listen to both stdout and stderr
  (io.stdout as Stream).onData((chunk) => {
    console.log(`[STDOUT]: ${chunk}`);
  });

  (io.stderr as Stream).onData((chunk) => {
    console.error(`[STDERR]: ${chunk}`);
  });

  // Process execution with mixed output
  io.stdout.write("Starting process...\n");
  io.stderr.write("Warning: Deprecated API used\n");
  io.stdout.write("Processing data...\n");
  io.stderr.write("Error: Connection timeout\n");
  io.stdout.write("Retrying...\n");
  io.stdout.write("Done!\n");
}

// ============================================================================
// Example 4: Interactive Process (like a REPL)
// ============================================================================

async function example4_InteractiveProcess() {
  console.log("\n=== Example 4: Interactive Process ===");

  const io = createProcessIO();

  // Setup process that prompts for input
  io.stdin.onData((input) => {
    if (input === "exit") {
      io.stdout.write("Goodbye!\n");
      return;
    }

    io.stdout.write(`You said: ${input}\n`);
    io.stdout.write("> ");
  });

  (io.stdout as Stream).onData((chunk) => {
    console.log(chunk);
  });

  // Start the interactive session
  io.stdout.write("Welcome! Type 'exit' to quit.\n");
  io.stdout.write("> ");

  // Simulate user interactions
  (io.stdin as Stream).write("Hello");
  (io.stdin as Stream).write("How are you?");
  (io.stdin as Stream).write("exit");
}

// ============================================================================
// Example 5: Piping Between Processes
// ============================================================================

async function example5_ProcessPiping() {
  console.log("\n=== Example 5: Piping Between Processes ===");

  const process1 = createProcessIO();
  const process2 = createProcessIO();

  // Pipe process1's stdout to process2's stdin
  (process1.stdout as Stream).onData((chunk) => {
    console.log(`[PIPE]: Process1 -> Process2: ${chunk}`);
    (process2.stdin as Stream).write(chunk);
  });

  // Process 2 transforms input and writes to its stdout
  process2.stdin.onData((input) => {
    const transformed = input.toUpperCase();
    process2.stdout.write(transformed);
  });

  // Final output consumer
  (process2.stdout as Stream).onData((chunk) => {
    console.log(`[FINAL OUTPUT]: ${chunk}`);
  });

  // Process 1 generates data
  process1.stdout.write("hello world");
  process1.stdout.write("this is a test");
}

// ============================================================================
// Example 6: Async Iteration for Streaming Data
// ============================================================================

async function example6_AsyncIteration() {
  console.log("\n=== Example 6: Async Iteration ===");

  const io = createProcessIO();

  // Consumer using async iteration
  const consumer = (async () => {
    console.log("Starting async consumer...");
    let count = 0;
    for await (const chunk of io.stdout as Stream) {
      console.log(`[CHUNK ${count++}]: ${chunk}`);
      if (count >= 5) break; // Stop after 5 chunks
    }
    console.log("Consumer finished");
  })();

  // Producer writing data
  await new Promise((resolve) => setTimeout(resolve, 10));

  for (let i = 0; i < 5; i++) {
    io.stdout.write(`Data chunk ${i}`);
  }

  await consumer;
}

// ============================================================================
// Example 7: Complex Process with All Streams
// ============================================================================

class FileProcessor {
  private io: ProcessIO;

  constructor() {
    this.io = createProcessIO();
    this.setupStreams();
  }

  private setupStreams() {
    // Handle input commands
    this.io.stdin.onData((command) => {
      this.handleCommand(command);
    });
  }

  private handleCommand(command: string) {
    const parts = command.trim().split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case "read":
        this.readFile(args[0]);
        break;
      case "write":
        this.writeFile(args[0], args.slice(1).join(" "));
        break;
      case "list":
        this.listFiles();
        break;
      default:
        this.io.stderr.write(`Error: Unknown command '${cmd}'\n`);
        this.io.stderr.write("Available commands: read, write, list\n");
    }
  }

  private readFile(filename: string) {
    if (!filename) {
      this.io.stderr.write("Error: No filename provided\n");
      return;
    }

    this.io.stdout.write(`Reading file: ${filename}\n`);
    this.io.stdout.write("File contents would go here...\n");
  }

  private writeFile(filename: string, content: string) {
    if (!filename) {
      this.io.stderr.write("Error: No filename provided\n");
      return;
    }

    this.io.stdout.write(`Writing to file: ${filename}\n`);
    this.io.stdout.write(`Content: ${content}\n`);
    this.io.stdout.write("File written successfully\n");
  }

  private listFiles() {
    this.io.stdout.write("Files in directory:\n");
    this.io.stdout.write("- file1.txt\n");
    this.io.stdout.write("- file2.txt\n");
    this.io.stdout.write("- file3.txt\n");
  }

  getIO(): ProcessIO {
    return this.io;
  }
}

function example7_ComplexProcess() {
  console.log("\n=== Example 7: Complex Process with All Streams ===");

  const processor = new FileProcessor();
  const io = processor.getIO();

  // Monitor all streams
  (io.stdout as Stream).onData((chunk) => {
    console.log(`[OUT]: ${chunk.trimEnd()}`);
  });

  (io.stderr as Stream).onData((chunk) => {
    console.error(`[ERR]: ${chunk.trimEnd()}`);
  });

  // Send commands
  (io.stdin as Stream).write("list");
  (io.stdin as Stream).write("read file1.txt");
  (io.stdin as Stream).write("write newfile.txt Hello World");
  (io.stdin as Stream).write("invalid_command");
}

// ============================================================================
// Example 8: Creating a Process Context
// ============================================================================

async function example8_ProcessContext() {
  console.log("\n=== Example 8: Process Context ===");

  const io = createProcessIO();

  const context: ProcessContext = {
    io,
    args: ["--verbose", "--output=result.txt"],
    env: {
      HOME: "/home/user",
      PATH: "/usr/bin:/bin",
      NODE_ENV: "production",
    },
  };

  // Simulate process using context
  (context.io.stdout as Stream).onData((chunk) => {
    console.log(chunk);
  });

  context.io.stdout.write(`Arguments: ${context.args.join(" ")}\n`);
  context.io.stdout.write(`Environment:\n`);
  for (const [key, value] of Object.entries(context.env)) {
    context.io.stdout.write(`  ${key}=${value}\n`);
  }
}

// ============================================================================
// Run all examples
// ============================================================================

export async function runAllExamples() {
  example1_SimpleOutput();
  example2_ReadingInput();
  example3_ErrorHandling();
  await example4_InteractiveProcess();
  await example5_ProcessPiping();
  await example6_AsyncIteration();
  example7_ComplexProcess();
  await example8_ProcessContext();
}

// Uncomment to run:
// runAllExamples().catch(console.error);

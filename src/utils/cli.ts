import { ReadableStream, WritableStream } from "./stream";

export async function readLine(
  stdin: ReadableStream,
  stdout: WritableStream,
): Promise<string> {
  let input = "";
  for await (const chunk of stdin) {
    if (chunk == "\r" || chunk == "\n") {
      stdout.write("\r\n");
      break;
    }
    if (chunk == "\b") {
      if (input.length > 0) {
        input = input.slice(0, -1);
        stdout.write("\b \b");
      }
      continue;
    }
    input += chunk;
    stdout.write(chunk);
  }
  return input.trim();
}

export async function waitApprove(
  prompt: string,
  stdin: ReadableStream,
  stdout: WritableStream,
): Promise<boolean> {
  stdout.write(prompt + " (y/n): ");
  const input = await readLine(stdin, stdout);
  if (input.toLowerCase() === "y" || input.toLowerCase() === "yes") {
    return true;
  }
  return false;
}

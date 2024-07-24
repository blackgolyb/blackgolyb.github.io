import { describe, it, expect } from "vitest";
import { updateTrigger, checkTrigger } from "./useTrigger";

const testCasesUpdateTrigger = [
	{ input: [0, false], expected: 1 },
	{ input: [1, false], expected: 0 },
	{ input: [2, false], expected: 1 },
	{ input: [3, false], expected: 0 },
	{ input: [0, true], expected: 3 },
	{ input: [1, true], expected: 2 },
	{ input: [2, true], expected: 3 },
	{ input: [3, true], expected: 2 },
];

const testCasesCheckTrigger = [
	{ input: 0, expected: false },
	{ input: 1, expected: false },
	{ input: 2, expected: true },
	{ input: 3, expected: true },
];

describe("test updateTrigger", () => {
	for (const data of testCasesUpdateTrigger) {
		it(`updateTrigger currentTrigger=${data.input[0]} incomingTriggerValue=${data.input[1]}`, () => {
			const result = updateTrigger(...data.input);
			expect(result).toBe(data.expected);
		});
	}
});

describe("test checkTrigger", () => {
	for (const data of testCasesCheckTrigger) {
		it(`checkTrigger value=${data.input}`, () => {
			const result = checkTrigger(data.input);
			expect(result).toBe(data.expected);
		});
	}
});

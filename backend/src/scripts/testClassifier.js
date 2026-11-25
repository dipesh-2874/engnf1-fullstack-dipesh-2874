import assert from "node:assert/strict";
import { classifyTicket } from "../services/ticketClassifier.js";

const tests = [
  ["My package has not arrived", "DELIVERY", "HIGH"],
  ["Need a refund", "BILLING", "HIGH"],
  ["Account locked out", "LOGIN", "URGENT"],
  ["Production down", "FEATURE_REQUEST", "URGENT"],
  ["Application error 500", "BUG", "HIGH"],
  ["Please add dark mode", "FEATURE_REQUEST", "MEDIUM"],
  ["Urgent refund required", "BILLING", "URGENT"],
];

for (const [subject, category, priority] of tests) {
  assert.deepEqual(classifyTicket(subject, ""), { category, priority }, subject);
}

console.log(`Passed ${tests.length} classifier cases.`);

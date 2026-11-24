import { classifyTicket } from "../services/ticketClassifier.js";

const tests = [
  "My package has not arrived",
  "Need a refund",
  "Account locked out",
  "Production down",
  "Application error 500",
  "Please add dark mode",
  "Urgent refund required",
];

for (const subject of tests) {
  console.log(subject, "=>", classifyTicket(subject, ""));
}

const BASE_URL = "http://localhost:5000";

const token = process.env.TEST_TOKEN;
const resourceId = process.env.TEST_RESOURCE_ID;

if (!token || !resourceId) {
  throw new Error(
    "Set TEST_TOKEN and TEST_RESOURCE_ID first"
  );
}

// Choose the next available 30-minute UTC boundary,
// at least 24 hours in the future.
const SLOT_MS = 30 * 60 * 1000;

const startMs =
  Math.ceil((Date.now() + 24 * 60 * 60 * 1000) / SLOT_MS) *
  SLOT_MS;

const body = {
  resourceId,
  startTime: new Date(startMs).toISOString(),
  endTime: new Date(startMs + 2 * SLOT_MS).toISOString(),
  purpose: "Concurrency test booking",
};

console.log("Testing slot:", body.startTime, body.endTime);

const sendRequest = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return {
      status: response.status,
      body: await response.json(),
    };
  } catch (error) {
    return {
      status: "NETWORK_ERROR",
      body: error.message,
    };
  }
};

// Fire all 10 requests concurrently.
const results = await Promise.all(
  Array.from({ length: 10 }, sendRequest)
);

console.table(
  results.map((result, index) => ({
    request: index + 1,
    status: result.status,
  }))
);

const successes = results.filter(r => r.status === 201);
const conflicts = results.filter(r => r.status === 409);

console.log("201 Created:", successes.length);
console.log("409 Conflict:", conflicts.length);

const passed =
  successes.length === 1 &&
  conflicts.length === 9;

console.log(passed ? "B6 PASS" : "B6 FAIL");

if (!passed) {
  console.log("Full responses:", results);
  process.exitCode = 1;
}

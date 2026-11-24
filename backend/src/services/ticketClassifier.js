const categoryRules = [
  {
    category: "BILLING",
    keywords: ["refund", "invoice", "charge", "payment"],
  },
  {
    category: "LOGIN",
    keywords: ["password", "2fa", "sign in", "locked out", "login"],
  },
  {
    category: "DELIVERY",
    keywords: ["package", "arrived", "shipping", "tracking", "delivery"],
  },
  {
    category: "BUG",
    keywords: ["crash", "error", "500", "exception", "broken"],
  },
];

const priorityRules = [
  {
    priority: "URGENT",
    keywords: ["urgent", "production down", "locked out"],
  },
  {
    priority: "HIGH",
    keywords: ["error", "refund", "not arrived"],
  },
];

export const classifyTicket = (subject, body) => {
  if (typeof subject !== "string" || typeof body !== "string") {
    throw new TypeError("Subject and body must be strings");
  }

  const text = `${subject} ${body}`.toLowerCase();

  const categoryRule = categoryRules.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  );
  const priorityRule = priorityRules.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  );

  return {
    category: categoryRule?.category ?? "FEATURE_REQUEST",
    priority: priorityRule?.priority ?? "MEDIUM",
  };
};

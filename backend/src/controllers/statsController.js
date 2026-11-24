import Ticket from "../models/Ticket.js";

const CATEGORIES = [
  "BILLING",
  "BUG",
  "FEATURE_REQUEST",
  "LOGIN",
  "DELIVERY",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const toDistribution = (values, rows) => {
  const distribution = Object.fromEntries(values.map((value) => [value, 0]));

  for (const row of rows) {
    distribution[row._id] = row.count;
  }

  return distribution;
};

export const getTicketStats = async (req, res) => {
  try {
    const [stats] = await Ticket.aggregate([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalTickets: { $sum: 1 },
                reviewedTickets: {
                  $sum: { $cond: [{ $eq: ["$isReviewed", true] }, 1, 0] },
                },
                agreements: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$isReviewed", true] },
                          { $eq: ["$autoCategory", "$category"] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          categories: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
          ],
          priorities: [
            { $group: { _id: "$priority", count: { $sum: 1 } } },
          ],
          statuses: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const summary = stats.summary[0] ?? {
      totalTickets: 0,
      reviewedTickets: 0,
      agreements: 0,
    };
    const modelAgreementRate = summary.reviewedTickets === 0
      ? 0
      : Number(
          ((summary.agreements / summary.reviewedTickets) * 100).toFixed(2)
        );

    return res.status(200).json({
      totalTickets: summary.totalTickets,
      reviewedTickets: summary.reviewedTickets,
      categoryDistribution: toDistribution(CATEGORIES, stats.categories),
      priorityDistribution: toDistribution(PRIORITIES, stats.priorities),
      statusDistribution: toDistribution(STATUSES, stats.statuses),
      modelAgreementRate,
    });
  } catch (error) {
    console.error("Get ticket stats error:", error);

    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch ticket statistics",
      },
    });
  }
};
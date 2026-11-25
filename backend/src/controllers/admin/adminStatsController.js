import Resource from "../../models/Resource.js";
import Booking from "../../models/Booking.js";

const sendError = (res, status, code, message) => {
  return res.status(status).json({
    error: { code, message },
  });
};

// GET /api/admin/stats
export const getAdminStats = async (req, res) => {
  try {
    // Fetch analytics concurrently
    const [
      totalResources,
      activeResources,
      totalBookings,
      bookingStatusData,
      topResourcesData,
    ] = await Promise.all([
      Resource.countDocuments(),

      Resource.countDocuments({ isActive: true }),

      Booking.countDocuments(),

      // Count bookings by status
      Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Top 3 resources by booking count
      Booking.aggregate([
        {
          $group: {
            _id: "$resourceId",
            bookingCount: { $sum: 1 },
          },
        },
        {
          $sort: {
            bookingCount: -1,
            _id: 1,
          },
        },
        {
          $limit: 3,
        },
        {
          $lookup: {
            from: Resource.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "resource",
          },
        },
        {
          $unwind: "$resource",
        },
        {
          $project: {
            _id: 0,
            resourceId: "$_id",
            name: "$resource.name",
            type: "$resource.type",
            bookingCount: 1,
          },
        },
      ]),
    ]);

    // Initialize every booking status with zero
    const bookingsByStatus = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };

    // Fill actual values from MongoDB
    for (const item of bookingStatusData) {
      if (
        Object.prototype.hasOwnProperty.call(
          bookingsByStatus,
          item._id
        )
      ) {
        bookingsByStatus[item._id] = item.count;
      }
    }

    const inactiveResources =
      totalResources - activeResources;

    return res.status(200).json({
      totalResources,
      activeResources,
      inactiveResources,
      totalBookings,
      bookingsByStatus,
      topResources: topResourcesData,
    });
  } catch (error) {
    console.error("Admin statistics error:", error);

    return sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Failed to fetch admin statistics"
    );
  }
};

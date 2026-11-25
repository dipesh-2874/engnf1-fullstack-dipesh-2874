import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 60,
        },
        type: {
            type: String,
            required: true,
            enum: ["ROOM", "LAB", "EQUIPMENT"],
        },
        capacity: {
            type: Number,
            required: true,
            min: 1,
            max: 500,
            validate: {
                validator: Number.isInteger,
                message: "Capacity must be Integer",
            },
        },
        description: {
            type: String,
            trim: true,
            maxlength: 300,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        bookingVersion: {
            type: Number,
            default: 0,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.bookingVersion;
                return ret;
            },
        },
    }
);

resourceSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  }
);

const Resource = mongoose.model(
  "Resource",
  resourceSchema
);

export default Resource;
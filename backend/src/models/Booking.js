import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        TicketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            default: null,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
            validate: {
                validator: function(value){
                    return ( 
                        this.startTime &&
                        value > this.startTime
                    );    
                },
                message: "End time must be after Start time.",
            },
        },

        purpose: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 200,
        },

        status: {
            type: String,
            required: true,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        descisionNote: {
            type: String,
            trim: true,
            minlength: 5,
            maxlength: 200,
            default: null,
            validate: {
                validator: function(value){
                    if(this.status === "REJECTED"){
                        return (
                            typeof value === "string" &&
                            value.trim().length >= 5 &&
                            value.trim().length <= 200
                        );
                    }
                    return true;
                },
                message: "Rejection Note is required (5-200 characters)",
            },
        },
    },
    {
        timestamps: {
            createdAt: true,
            updatedAt: false,
        },
    }
);

bookingSchema.index({
  resourceId: 1,
  startTime: 1,
  endTime: 1,
});

bookingSchema.index({
  userId: 1,
  createdAt: -1,
});

const Booking = mongoose.model(
  "Booking",
  bookingSchema
);

export default Booking;
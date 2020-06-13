const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add course title"],
  },
  description: {
    type: String,
    required: [true, "Please add description"],
  },
  weeks: {
    type: Number,
    require: [true, "Please add course's weeks"],
  },
  tuition: {
    type: Number,
    require: [true, "Please add tuition fee"],
  },
  minimumSkill: {
    type: String,
    required: true,
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipsAvailable: {
    type: Boolean,
    default: false,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log(this, bootcampId);
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);
  console.log(obj, obj.length);
  if (obj.length) {
    try {
      await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
      });
    } catch (err) {
      console.error(err);
    }
  } else {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: 0,
    });
  }
};

// Call getAverageCost after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});
module.exports = mongoose.model("Course", CourseSchema);

const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add title for review"],
    maxlength: 50,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    require: [true, "Please add a rating between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
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

//only one review per one user
ReviewSchema.index({ user: 1, bootcamp: 1 }, { unique: true });

//statics method to calculate average rating
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  let objArr = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (objArr.length) {
    try {
      await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
        averageRating: Math.floor(objArr[0].averageRating),
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: 0,
    });
  }
};

//Call getAverageRating
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});
module.exports = mongoose.model("Review", ReviewSchema);

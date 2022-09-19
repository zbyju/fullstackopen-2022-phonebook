const mongoose = require("mongoose");

const url = process.env.MONGODB_URL;

mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    unique: true,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function (v) {
        if (v.length < 8) return false;
        const split = v.split("-");
        if (split.length !== 2) return false;
        if (split[0].length !== 2 && split[0].length !== 3) return false;
        return /^\d+$/.test(split[0]) && /^\d+$/.test(split[1]);
      },
    },
    message: (props) => `${props.value} is not a valid phone number!`,
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);

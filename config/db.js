const mongoose = require("mongoose");

const connect = async () => {
  const con = await mongoose.connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(`MongoDb connected: ${con.connection.host}`.cyan.underline.bold);
};

module.exports = connect;

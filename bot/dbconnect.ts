import mongoose,{ connection } from "mongoose"
const url = "mongodb+srv://dbuser:Yb3lkvkM3g4CLdAw@cluster0.nrt6dmz.mongodb.net/lotterybot?retryWrites=true&w=majority";
export default async function db() {
  await mongoose.connect(url);
}
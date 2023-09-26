
import mongoose from "mongoose";
const groupSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    admin:{
        type:String,
        required:true
    },
    chatID:{
        type:Number,
        required:true
    },
    address:{
        type:String,
        required:true
    }
})
// mongoose.models ={}
const Groups = mongoose.model("Groups",groupSchema)
export default Groups;
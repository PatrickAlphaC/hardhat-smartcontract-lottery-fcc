import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userid:{
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
    },
    PrivateKey:{
        type:String,
        required:true
    }
})

const Users = mongoose.model("Users",userSchema)
export default Users;
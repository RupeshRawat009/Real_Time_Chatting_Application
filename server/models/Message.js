import mongoose from "mongoose";
const MesaageSchema= new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    receiverId:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    text: {type: String, },
    image:{type:String, },
    seen: {type:Boolean,default:false}
},{timestamps:true})

const Message=mongoose.model("Message",MesaageSchema);

export default Message;
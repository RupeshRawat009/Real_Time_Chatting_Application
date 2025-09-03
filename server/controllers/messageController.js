import User from "../models/user.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import {io,userSocketMap} from "../server.js";
// This file contains a function to get all users for a sidebar, excluding the logged-in user.
// It also counts the number of unread messages for each user.

export const getUsersForSidebar = async (req, res) => {
  try {
    // Get the user ID of the currently logged-in user
    const userId = req.user._id;

    // Find all users except the logged-in user and exclude their password from the results
    const filteredUsers = await User.find({
      _id: {
        $ne: userId
      }
    }).select("-password");

    // Initialize an object to store the count of unseen messages for each user
    const unseenMessages = {};

    // Use a map to create an array of promises for counting unseen messages for each user
    const promises = filteredUsers.map(async (user) => {
      // Find messages where the sender is the user and the receiver is the logged-in user, and the message has not been seen
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false
      });

      // If there are unseen messages, add the count to the unseenMessages object
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
    res.json({ success:true,users:filteredUsers,unseenMessages})

    // You would typically send the users and the unseen message count back in the response
    // For example: res.status(200).json({ users: filteredUsers, unseenMessages });

  } catch (error) {
    // Basic error handling
    console.error(error.messages);
    res.json({ success:false,messages: error.messages})

    // For example: res.status(500).json({ message: "Server error" });
  }
};
// This function retrieves all messages for a specific chat between two users.
// It also marks all received messages as "seen."

export const getMessages = async (req, res) => {
  try {
    // Get the selected user's ID from the request parameters
    const {
      id: selectedUserId
    } = req.params;

    // Get the ID of the currently logged-in user
    const myId = req.user._id;

    // Find all messages between the two users
    const messages = await Message.find({
      $or: [{
        senderId: myId,
        receiverId: selectedUserId
      }, {
        senderId: selectedUserId,
        receiverId: myId,
      }, ],
    });

    // Update messages sent by the selected user to the current user, marking them as seen
    await Message.updateMany({
      senderId: selectedUserId,
      receiverId: myId
    }, {
      seen: true
    });
    res.json({success:true,messages})

    // You would typically send the messages back in the response
    // For example: res.status(200).json(messages);

  } catch (error) {
    // Log the error message to the console
    console.log(error.message);

    // Send an error response back to the client
    res.json({
      success: false,
      message: error.message
    });
  }
};

// This API endpoint marks a message as seen using its message ID.
export const markMessageAsSeen = async (req, res) => {
  try {
    // Extract the message ID from the request parameters
    const {
      id
    } = req.params;

    // Find the message by its ID and update the 'seen' field to true
    await Message.findByIdAndUpdate(id, {
      seen: true
    });

    // Send a success response back to the client
    res.json({
      success: true
    });
  } catch (error) {
    // Log the error message to the console
    console.log(error.message);

    // Send an error response back to the client
    res.json({
      success: false,
      message: error.message
    });
  }
};

//send message to selected user

export const sendMessage = async (req,res)=>{
  try {
  const { text, image } = req.body;
  const receiverId = req.params.id;
  const senderId = req.user._id;

  let imageUrl;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }
  const newMessage= await Message.create({
  senderId,
  receiverId,
  text,
  image:imageUrl
  })

  //emit the new message to the receivers socket
  const receiverSocketId= userSocketMap[receiverId];
  if(receiverSocketId){
    io.to(receiverSocketId).emit("newMessage",newMessage)
  }
  res.json({success:true,newMessage});

} catch (error) {
  console.log(error.message);
  res.json({ success: false, message: error.message });
}
}
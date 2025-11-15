import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io"; 
import { User } from "./models/user.model.js";

export const socketHandler = async (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
    io.on("connection",(socket)=>{
        console.log("socketId",socket.id)

        socket.on("identity",async({userId}:{userId:string})=>{
          try {
            const user=await User.findByIdAndUpdate(userId,{
              isOnline:true,
              socketId:socket.id
            },{
              new:true
            })
          } catch (error) {
            console.log(error)
          }
        })

        socket.on("updateLocation",async ({latitude,longitude,userId})=>{
          try {
            const user=await User.findByIdAndUpdate(userId,{
              location:{
                type:"Point",
                coordinates:[longitude,latitude]
              },
              isOnline:true,
              socketId:socket.id
            })

            if(user){
              io.emit("updateDeliveryLocation",{
                deliveryBoyId:userId,
                latitude,
                longitude
              });
            }           
          } catch (error) {
            console.log(error)
          }
        })

        socket.on("disconnect",async()=>{         
          try {
           const user= await User.findOneAndUpdate({socketId:socket.id},{
              socketId:null,
              isOnline:false
            },{
              new:true
            })
            console.log("diconnected",socket.id)
          } catch (error) {
            console.log(error)
          }
        })
    })
};

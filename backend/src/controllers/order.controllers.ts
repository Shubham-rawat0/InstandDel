import { Request, Response } from "express";
import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import { User } from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.models.js";
import { Types } from "mongoose";
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url";
import { deliveryOtpMAil } from "../utils/mail.js";
import Razorpay from "razorpay";

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
dotenv.config({path:path.resolve(__dirname,"../../.env")})

interface CartItem {
  _id: string ;
  name: string;
  price: number;
  category: string;
  foodType: string;
  image: string | null;
  shop: string  ;
  quantity: number;
}

const key_id=process.env.RAZOR_KEY_ID
const key_secret=process.env.RAZOR_SECRETKEY

if(!key_id || !key_secret){
  throw new Error("no env variables")
}

let instance=new Razorpay({
  key_id,
  key_secret
})

type Stats = Record<number, number>;

export const placeOrder = async (req: Request, res: Response) => {
    try {
      const { cartItem, paymentMethod, deliveryAddress, totalAmount } =
        req.body;
      if (cartItem.length == 0 || !cartItem) {
        return res
          .status(400)
          .json({ message: "cart is empty, can't place order" });
      }
      if (
        !deliveryAddress.text ||
        !deliveryAddress.latitude ||
        !deliveryAddress.longitude
      ) {
        return res
          .status(400)
          .json({ message: ",send complete delivery address" });
      }
      const groupItemsByShop: Record<string, CartItem[]> = {};

      cartItem.forEach((item: CartItem) => {
        const shopId = item.shop;
        if (!groupItemsByShop[shopId]) {
          groupItemsByShop[shopId] = [];
        }
        groupItemsByShop[shopId].push(item);
      });
      const shopOrders = await Promise.all(
        Object.keys(groupItemsByShop).map(async (shopId) => {
          const shop = await Shop.findById(shopId).populate("owner");
          if (!shop) {
            return res.status(400).json({ message: "shop not found" });
          }
          const items = groupItemsByShop[shopId];
          const subtotal = items.reduce(
            (sum, i) => sum + Number(i.price) * Number(i.quantity),
            0
          );
          return {
            shop: shop._id,
            owner: shop.owner._id,
            subTotal: subtotal,
            shopOrderItems: items.map((i) => ({
              item: i._id,
              price: i.price,
              quantity: i.quantity,
              name: i.name,
            })),
          };
        })
      );

      if (paymentMethod == "online") {
        const razorOrder = await instance.orders.create({
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });

        const newOrder = await Order.create({
          user: req.userId,
          paymentMethod,
          totalAmount,
          deliveryAddress,
          shopOrders,
          razorpayOrderId: razorOrder.id,
          payment: false,
        });
        return res
          .status(201)
          .json({
            razorOrder,
            orderId: newOrder._id,
            key_id,
            message: "order placed successfully",
          });
      }

      let newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        totalAmount,
        deliveryAddress,
        shopOrders,
      });

      newOrder = await Order.findById(newOrder._id)
        .populate({
          path: "shopOrders",
          populate: [
            { path: "shop", select: "name" },
            { path: "owner", select: "fullName socketId _id" },
            { path: "shopOrderItems.item", select: "name image price" },
            { path: "assignedDeliveryBoy", select: "fullName mobile" },
            { path: "assignment" },
          ],
        })
        .populate("user", "name email mobile") as any;

      
        const io=req.app.get("io")
      if (io) {
        newOrder.shopOrders.forEach((shopOrder) => {
          const owner = shopOrder as unknown as {
            owner: {
              _id: string;
              fullName: string;
              socketId: string;
            };
          };
          const ownerSocketId = owner?.owner?.socketId;
          if (ownerSocketId) {
            io.to(ownerSocketId).emit("newOrder", {
              _id: newOrder._id,
              paymentMethod: newOrder.paymentMethod,
              user: newOrder.user,
              deliveryAddress: newOrder.deliveryAddress,
              shopOrders:shopOrder,
              createdAt: newOrder.createdAt,
              payment: newOrder.payment,
              razorpayOrderId: newOrder.razorpayOrderId,
              razorpayPaymentId: newOrder.razorpayPaymentId,
            });
          }
        });
      }

      return res
        .status(201)
        .json({ newOrder, message: "order placed successfully" });
    }
     catch (error) {
         return res.status(500).json({ message: "Server error while processing order", error });
    }
};

export const getMyOrder = async (req: Request, res: Response) => {
    try {
        const userId=req.userId
        const user=await User.findById(userId)
        if(user && user.role==="user"){
            const orders = await Order.find({ user: userId })
              .sort({ createdAt: -1 })
              .populate("shopOrders.shop", "name")
              .populate("shopOrders.owner", "name email mobile")
              .populate("user")
              .populate("shopOrders.shopOrderItems.item", "name image price");
            return res.status(200).json(orders);
        }
        else if(user && user.role==="owner"){
            const orders = await Order.find({ "shopOrders.owner": userId })
              .sort({ createdAt: -1 })
              .populate("shopOrders.shop", "name")
              .populate("user")
              .populate("shopOrders.shopOrderItems.item", "name image price")
              .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const filteredOrder = orders.map((order) => ({
              _id: order._id,
              paymentMethod: order.paymentMethod,
              user: order.user,
              deliveryAddress: order.deliveryAddress,
              shopOrders: order.shopOrders.find((o) => o?.owner?._id == userId),
              createdAt: order.createdAt,
              payment: order.payment,
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: order.razorpayPaymentId,
            }));
            return res.status(200).json(filteredOrder);
        }
    } catch (error) {
        return res.status(500).json({ message: "Server error while finding order", error });
    }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (o) => o.shop?.toString() === shopId
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "Shop order not found" });
    }

    shopOrder.status = status;

    let availableDeliveryBoysPayload: {
      _id: string;
      fullName: string;
      latitude: number | undefined;
      longitude: number | undefined;
      mobile: string;
    }[] = [];

    const canBroadcast =
     ( status === "out of delivery" &&
      !shopOrder.assignment) &&
      order.deliveryAddress?.longitude != null &&
      order.deliveryAddress?.latitude != null;

    if (canBroadcast) {
     const longitude = order.deliveryAddress?.longitude;
     const latitude = order.deliveryAddress?.latitude;

     if (longitude == null || latitude == null) {
       return res.status(400).json({ message: "Delivery location missing" });
     }

      const nearbyDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearbyIds = nearbyDeliveryBoys.map((b) => b._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearbyIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busySet = new Set(busyIds.map((id) => id.toString()));

      const available = nearbyDeliveryBoys.filter(
        (b) => !busySet.has(b._id.toString())
      );

      const candidates = available.map((a) => a._id.toString());

      if (candidates.length === 0) {
        await order.save();
        return res.status(200).json({
          shopOrder,
          message:
            "Order status updated but no delivery boy is available for this location",
        });
      }

      const newAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates, 
        status: "broadcasted",
      }) as any;

      shopOrder.assignment = newAssignment._id;
      shopOrder.assignedDeliveryBoy = newAssignment.assignedTo || null;

      availableDeliveryBoysPayload = available.map((b) => ({
        _id: b._id.toString(),
        fullName: b.fullName,
        mobile: b.mobile,
        latitude: b.location?.coordinates?.[1],
        longitude: b.location?.coordinates?.[0],
      }));

      await newAssignment.populate("order")
      await newAssignment.populate("shop");

      const io=req.app.get("io")
      if(io){
        available.forEach(boy=>{
          const boySocketId=boy.socketId
          if(boySocketId){
            io.to(boySocketId).emit("newAssignment", {
              sentTo:boy._id,
              assignmentId: newAssignment._id,
              orderId: newAssignment?.order?._id,
              shopName: newAssignment.shop?.name,
              deliveryAddress: newAssignment.order?.deliveryAddress,
              items:
                newAssignment?.order?.shopOrders?.find((so:any) =>
                  so._id.equals(newAssignment.shopOrderId)
                ) || [],
              subTotal: newAssignment?.order?.shopOrders?.find((so:any) =>
                so._id.equals(newAssignment.shopOrderId)
              )?.subTotal,
            });

          }
        })
      }
    }

    await order.save();

    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile"
    );
    await order.populate(
      "user",
      "socketId"
    );
    await order.populate("shopOrders.assignment", "status broadcastedTo");

    const updatedShopOrder = order.shopOrders.find(
      (o) => o.shop?._id?.toString() === shopId
    );

    const io=req.app.get("io")
    if(io){
      
      const userOrder = order.user as unknown as {
        socketId: string;
      };
      const userSocketId=userOrder.socketId
      if (userSocketId) {
        io.to(userSocketId).emit("update-status",{
          orderId:order._id,
          shopId:updatedShopOrder?._id,
          status:updatedShopOrder?.status,
          userId:order.user?._id
        })
      }
    }

    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy || null,
      availableBoys: availableDeliveryBoysPayload,
      assignment: updatedShopOrder?.assignment?._id || null,
      message: "Order status updated successfully",
    });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return res.status(500).json({
      message: "Server error while updating order status",
      error: err,
    });
  }
};

export const getDeliveryBoyAssignment = async (req: Request, res: Response) => {
    try {
        const deliveryBoyId=req.userId
        const assignments=await DeliveryAssignment.find({
            broadcastedTo:deliveryBoyId,
            status:"broadcasted"
        }).populate("order").populate("shop")
        
        const formatted = assignments.map((a) => {
           const order = a.order as unknown as {
             shopOrders: {
               _id: string;
               shopOrderItems: any[];
               subTotal: number;
             }[];
             deliveryAddress: {
               text: string;
               latitude: number;
               longitude: number;
             };
           };

           const shop = a.shop as unknown as {
             _id: string;
             name: string;
           };
            const matchingShopOrder = order.shopOrders?.find(
            (so:any) => String(so._id) === String(a.shopOrderId)
            )?.shopOrderItems;

            const subTotal=order.shopOrders?.find((so:any)=>String(so._id)===String(a.shopOrderId))?.subTotal
            return {
            assignmentId:a._id,
            orderId: shop?._id,
            shopName: shop?.name,
            deliveryAddress: order?.deliveryAddress,
            items: matchingShopOrder, 
            subTotal
            };
        });

        return res.status(200).json(formatted)

    } catch(err) { 
        console.log(err)
        return res.status(500).json({
      message: "Server error while getting order for delivery boy",
      error: err,
    });}
}

export const acceptOrder = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "assignment not found" });
    }

    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "assignment is expired" });
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });

    if (alreadyAssigned) {
      return res.status(400).json({
        message: "you already have a assignment to deliver",
      });
    }

    assignment.assignedTo = new Types.ObjectId(req.userId);
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "order not found" });
    }

    const shopOrder = order.shopOrders.find(
      (so) => so._id.toString() === assignment.shopOrderId.toString()
    );

    if (shopOrder) {
      shopOrder.assignedDeliveryBoy = new Types.ObjectId(user._id);
    }

    await order.save();
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName mobile");

    return res.status(200).json({
      message: "order accepted successfully",
      assignedDeliveryBoy: shopOrder?.assignedDeliveryBoy, 
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server error while accepting order",
      error: err,
    });
  }
};

export const getCurrentOrder = async (req: Request, res: Response) => {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: new Types.ObjectId(req.userId),
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName mobile email location")
      .populate({
        path: "order",
        populate: [
          {
            path: "user",
            select: "fullName email location mobile",
          },
          {
            path: "shopOrders", 
            populate: {
              path: "shop", 
              select: "name address",
            },
          },
          {
            path: "shopOrders.shopOrderItems", 
            populate: {
              path: "item",
              select: "name image price",
            },
          },
        ],
      });

    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found" });
    }
    if (!assignment.order) {
      return res.status(400).json({ message: "Order not found" });
    }
    
    const order:any=assignment.order
    const shopOrder = order.shopOrders.find(
      (so: any) => String(so._id) === String(assignment.shopOrderId)
    );
    if (!shopOrder) {
      return res.status(400).json({ message: "ShopOrder not found" });
    }

    const assignmentLocation:any=assignment.assignedTo

     let deliveryBoyLocation = { lat: null, lon: null };
    if(assignmentLocation.location.coordinates.length==2){      
        deliveryBoyLocation.lat = assignmentLocation.location.coordinates[1];
        deliveryBoyLocation.lon = assignmentLocation.location.coordinates[0];       
    }

     const customerLocation = { lat: null, lon: null };
    if (
      order.deliveryAddress &&
      order.deliveryAddress.latitude != null &&
      order.deliveryAddress.longitude != null
    ) {
      customerLocation.lat = order.deliveryAddress.latitude;
      customerLocation.lon = order.deliveryAddress.longitude;
    }
    return res.status(200).json({
      _id:assignment.order._id,
      user:order.user,
      shopOrder,
      deliveryAddress:order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error while getting current order",
      error,
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const {orderId}=req.params
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({ path: "shopOrders.shop", model: "Shop" })
      .populate({ path: "shopOrders.assignedDeliveryBoy", model: "User" })
      .populate({ path: "shopOrders.shopOrderItems.item", model: "Item" }).lean();

    if(!order){
      return res.status(400).json({message:'order not found'})
    }
    return res.status(200).json(order);

  } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server error while getting orders",
        error,
      });
  }
}

export const sendDeliveryOtp = async (req: Request, res: Response) => {
  try {
    const {orderId,shopOrderId}=req.body
    const order=await Order.findById(orderId).populate("user")
    const shopOrder=order?.shopOrders.id(shopOrderId)
    if(!order || !shopOrder){
      return res.status(400).json({message:"enter valid order/shop order id"})
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp=otp
    shopOrder.otpExpires=Date.now() + 5*60*1000
    const userInOrder:any=order.user
    await deliveryOtpMAil(userInOrder.email,otp)
    await order.save()
     res.status(200).json({message:`OTP sent successfully to ${userInOrder.fullName}`})
  } 
  catch (error) {
     console.log(error);
     return res.status(500).json({
       message: "Server error while sending otp",
       error,
     });
  }
}

export const verifyDeliveryOtp = async (req: Request, res: Response) => {
  try {
    const {orderId,shopOrderId,otp}=req.body
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order?.shopOrders.id(shopOrderId);
    if (!order || !shopOrder) {
      return res
        .status(400)
        .json({ message: "enter valid order/shop order id" });
    }
    if(shopOrder.deliveryOtp!==otp || !shopOrder.otpExpires || shopOrder.otpExpires<Date.now()){
      return res.status(400).json({message:"invalid or expired otp"})
    }
    shopOrder.status="delivered"
    shopOrder.deliveredAt = new Date(Date.now());
    await order.save()

    await DeliveryAssignment.deleteOne({shopOrderId:shopOrder._id,order:order._id,
      assignedTo:shopOrder.assignedDeliveryBoy
    })

    return res.status(200).json({message:'order delivered successfully'})
  } catch (error) {
     console.log(error);
     return res.status(500).json({
       message: "Server error while verifying delivery otp",
       error,
     });
  }
}

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {razorpay_payment_id,orderId}=req.body
    const payment=await instance.payments.fetch(razorpay_payment_id)
    if(!payment || payment.status!="captured"){
      return res.status(400).json({message:"payment not captured"})
    }
    let order=await Order.findById(orderId)
    if(!order){
      return res.status(400).json({message:"order not found"})
    }
    order.payment=true;
    order.razorpayPaymentId=razorpay_payment_id
    await order.save()
    order = (await Order.findById(order._id)
     .populate({
       path: "shopOrders",
       populate: [
         { path: "shop", select: "name" },
         { path: "owner", select: "fullName socketId _id" },
         { path: "shopOrderItems.item", select: "name image price" },
         { path: "assignedDeliveryBoy", select: "fullName mobile" },
         { path: "assignment" },
       ],
     })
     .populate("user", "name email mobile")) as any;

   const io = req.app.get("io");
   if (io) {
     order?.shopOrders.forEach((shopOrder) => {
       const owner = shopOrder as unknown as {
         owner: {
           _id: string;
           fullName: string;
           socketId: string;
         };
       };
       const ownerSocketId = owner?.owner?.socketId;
       if (ownerSocketId) {
         io.to(ownerSocketId).emit("newOrder", {
           _id: order._id,
           paymentMethod: order.paymentMethod,
           user: order.user,
           deliveryAddress: order.deliveryAddress,
           shopOrders: shopOrder,
           createdAt: order.createdAt,
           payment: order.payment,
           razorpayOrderId: order.razorpayOrderId,
           razorpayPaymentId: order.razorpayPaymentId,
         });
       }
     });
   }
    return res.status(200).json({message:"payment successful",order})
  } catch (error) {
     console.log(error);
     return res.status(500).json({
       message: "Server error while verifying payment",
       error,
     });
  }
}


export const getTodayDelivery = async (req: Request, res: Response) => {
  try {
    const deliveryBoyId=req.userId
    const startOfDay=new Date()
    startOfDay.setHours(0,0,0,0)
    const orders=await Order.find({"shopOrders.assignedDeliveryBoy":deliveryBoyId,
      "shopOrders.status":"delivered",
      "shopOrders.deliveredAt":{$gte:startOfDay}
    }).lean()
    let todaysDelivery:any=[]
    orders.forEach(order=>{
      order.shopOrders.forEach(shopOrder=>{
        if(shopOrder.assignedDeliveryBoy==deliveryBoyId && shopOrder.status=="delivered" && shopOrder.deliveredAt && shopOrder.deliveredAt>=startOfDay){
          todaysDelivery.push(shopOrder)
        }
      })
    })
    let stats:Stats={}
    todaysDelivery.forEach((shopOrder :any)=>{
      const hour=new Date(shopOrder.deliveredAt).getHours()
      stats[hour]=(stats[hour]||0)+1
    })

   let formatedStats = Object.keys(stats).map((key) => {
     const hour = Number(key); 
     return {
       hour,
       count: stats[hour], 
     };
   });
   formatedStats.sort((a,b)=>a.hour-b.hour)

   res.status(200).json(formatedStats)

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error while getting todays delivery",
      error,
    });
  }
}
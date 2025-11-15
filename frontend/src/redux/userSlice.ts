import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


interface UserData {
  role: "user" | "owner" | "deliveryBoy";
  fullName: string;
  email:string;
  _id:string
  location: {
    type: "Point";
    coordinates: [Number|0, Number|0];
  };
}

interface Rating {
  average: number | 0;
  count: number | 0;
}
interface ShopData {
  _id: string | null;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  image: string | null;
}

interface Items {
  _id: string | null;
  name: string | null;
  price: number | null;
  category: string | null;
  foodType: string | null;
  image: string | null;
  rating: Rating;
  shop:string
}

interface CartItem {
  _id: string | null;
  name: string | null;
  price: number | 0;
  category: string | null;
  foodType: string | null;
  image: string | null;
  shop: string|null;
  quantity: number | 0;
}

interface ShopOrderItems {
  createdAt: string | "";
  item: {
    image: string | "";
    name: string | "";
    price: number | 0;
    _id: string | "";
  }
  name: string | "";
  price: number | 0;
  quantity:number|0;
  _id: string | "";
}

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  createdAt:string|""
  status: string | "";
  owner: {
    _id: "" | string;
    name: string | "";
  }|""|string;
  shop: {
    name: string | "";
    _id: string | "";
  };
  shopOrderItems: ShopOrderItems[];
  subTotal:number|0

}

interface OwnerOrderItem {
  _id: string;
  createdAt: string | "";
  name: string;
  price: number;
  quantity: number;
  status: string | "";
  owner: string | "";
  shop: {
    name: string | "";
    _id: string | "";
  };
  shopOrderItems: ShopOrderItems[];
  subTotal: number | 0;
  assignedDeliveryBoy: {
    mobile: string | "";
    fullName: string | "";
  };
}

interface UserMyOrder {
  _id: string;
  shopOrders: OrderItem[];
  paymentMethod: string | "";
  totalAmount: number;
  deliveryAddress: {
    text: string | "";
    latitude: number | 0;
    longitude: number | 0;
  };
  createdAt: string;
  user: string | "";
  payment: {
    type: Boolean;
    default: false;
  };
  razorpayOrderId: {
    type: String;
    default: "";
  };
  razorpayPaymentId: {
    type: String;
    default: "";
  };
}


interface OwnerMyOrder {
  _id: string;
  shopOrders: OwnerOrderItem;
  totalAmount: number;
  deliveryAddress: {
    text: string | "";
    latitude: number | 0;
    longitude: number | 0;
  };
  paymentMethod: string | "";
  createdAt: string;
  user: UserData;
  payment: {
    type: Boolean;
    default: false;
  };
  razorpayOrderId: {
    type: String;
    default: "";
  };
  razorpayPaymentId: {
    type: String;
    default: "";
  };
}


interface UserState {
  userData: UserData | null;
  currentCity: string | null;
  currentState: string | null;
  currentAddress: string | null;
  shopsInMyCity: ShopData[];
  itemsInMyCity: Items[];
  cartItem: CartItem[];
  totalAmount:number|0;
  myOrders:UserMyOrder[]|OwnerMyOrder[]|[];
   searchitems: ItemData[]|null;
}

interface ItemData {
  _id: string;
  name: string;
  category: string;
  foodType: "veg" | "non-veg" | string;
  image: string;
  price: number;
  rating: {
    average: number;
    count: number;
  };
  shop: string
}


const initialState: UserState = {
  userData: null,
  currentCity: null,
  currentState: null,
  currentAddress: null,
  shopsInMyCity: [],
  itemsInMyCity: [],
  cartItem: [],
  totalAmount: 0,
  myOrders: [],
  searchitems: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData | null>) => {
      state.userData = action.payload;
    },
    setCurrentCity: (state, action: PayloadAction<string | null>) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action: PayloadAction<string | null>) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action: PayloadAction<string | null>) => {
      state.currentAddress = action.payload;
    },
    setShopsInMyCity: (state, action: PayloadAction<ShopData[]>) => {
      state.shopsInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action: PayloadAction<Items[]>) => {
      state.itemsInMyCity = action.payload;
    },
    setAddToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.cartItem.find(
        (item) => item._id === newItem._id
      );
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.cartItem.push(newItem);
      }
      state.totalAmount=state.cartItem.reduce((sum,i)=>sum+i.price*i.quantity,0)
    },
    removeFromCart: (state, action: PayloadAction<string>) => {     
      state.cartItem = state.cartItem.filter(
        (item) => item._id !== action.payload
      );
      state.totalAmount = state.cartItem.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },
    clearCart: (state) => {
      state.cartItem = [];
    },
    updateQuantity:(state,action)=>{
      const {_id,quantity}=action.payload
      const item=state.cartItem.find(i=>i._id==_id)
      if(item){
        item.quantity=quantity
      }
      state.totalAmount = state.cartItem.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },
    setMyOrder:(state,action)=>{
      state.myOrders=action.payload
    },
    addMyOrder:(state,action)=>{
      state.myOrders=[action.payload,...state.myOrders]
    },
    updateOrderStatus:(state,action)=>{
      const {orderId,shopId,status}=action.payload
      const order=(state.myOrders as OwnerMyOrder[]).find(o=>o._id==orderId)
      if(order){
        if(order.shopOrders && order.shopOrders.shop._id==shopId){
          order.shopOrders.status=status
        }
      }
    },
    setSearchItems:(state,action)=>{
      state.searchitems=action.payload
    },
    updateRealTimeOrderStatus:(state,action)=>{
      const { orderId, shopId, status } = action.payload;
      const order = (state.myOrders as UserMyOrder[]).find(
        (o) => o._id == orderId
      );
      if (order) {
        const shopOrder=order.shopOrders.find(so=>so._id==shopId)
        if(shopOrder){
          shopOrder.status=status
        }
      }
    }
  },
});

export const {
  setUserData,
  updateRealTimeOrderStatus,
  setSearchItems,
  setCurrentCity,
  setCurrentState,
  setCurrentAddress,
  setShopsInMyCity,
  setItemsInMyCity,
  setAddToCart,
  removeFromCart,
  clearCart,updateOrderStatus,
  addMyOrder,
  updateQuantity,
  setMyOrder,
} = userSlice.actions;

export default userSlice.reducer;















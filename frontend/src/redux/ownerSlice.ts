import { createSlice } from "@reduxjs/toolkit";

interface Rating {
  average: number | 0;
  count: number | 0;
}

interface Items {
    _id:string|null;
  name: string | null;
  price: string | null;
  category: string | null;
  foodType: string | null;
  image: null | string;
  rating:Rating
}

interface ShopData {
  _id: string | null;
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  image: null | string;
  items: Items[];
}

interface shopState{
    myShopData:ShopData|null,
}
const initialState:shopState={
    myShopData:null
}

const ownerSlice=createSlice({
    name:"owner",
    initialState,
    reducers:{
        setMyShopData:(state,action)=>{
            state.myShopData=action.payload
        }
    }
})

export const { setMyShopData } = ownerSlice.actions;
export default ownerSlice.reducer
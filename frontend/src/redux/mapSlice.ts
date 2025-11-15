import { createSlice } from "@reduxjs/toolkit";

interface Location{
    lat:number|null;
    lon:number|null;
}

interface mapData{
    location:Location|null;
    address:string|null;
}

const initialState:mapData={
    location:null,
    address:null
}

const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    setLocation:(state,action)=>{
        const {lat,lon}=action.payload
        state.location={lat,lon}
    },
    setAddress:(state,action)=>{
        state.address=action.payload
    },
  },
});

export const {setAddress,setLocation} = mapSlice.actions;

export default mapSlice.reducer;

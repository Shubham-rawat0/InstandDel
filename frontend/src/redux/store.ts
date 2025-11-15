import {configureStore} from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import ownerSlice from "./ownerSlice"
import mapSlice from "./mapSlice"
export const store=configureStore({
    reducer:{
        user:userSlice,
        map:mapSlice,
        owner:ownerSlice
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
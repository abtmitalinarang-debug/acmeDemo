import { createSlice, type PayloadAction } from "@reduxjs/toolkit";




export interface ICartState {
  items:string[];
}



const initialState: ICartState = {
  items: [],
};



export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<Omit<string[], "quantity">>) {
   
    },


  
  },
});

export const { addItem } = cartSlice.actions;






export default cartSlice.reducer;

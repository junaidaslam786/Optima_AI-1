import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UsersState {
  selectedUserId: string | null;
}

const initialState: UsersState = {
  selectedUserId: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<string | null>) => {
      state.selectedUserId = action.payload;
    },
  },
});

export const { selectUser } = usersSlice.actions;
export default usersSlice.reducer;

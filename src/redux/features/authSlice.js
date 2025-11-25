import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GET } from "../../utils/request";

// Fetch user bằng token có sẵn (dùng khi reload)
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (token, { rejectWithValue }) => {
    try {
      const res = await GET("/users", { token: token }); 
      return res[0];
    } catch (error) {
      return rejectWithValue(error.message || "Unauthorized");
    }
  }
);

const initialState = {
  user: null,
  token: null,
  loading: false,
  isLoggedIn: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload;
      state.token = action.payload.token;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    // ---- FETCH USER ----
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isLoggedIn = true;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.token = null;
      });
  },
});

export const { logout, setAuth } = authSlice.actions;
export default authSlice.reducer;

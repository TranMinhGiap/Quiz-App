import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/features/authSlice';
import { fetchUser } from '../redux/features/authSlice';
import Cookies from 'js-cookie';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  }
});

const token = Cookies.get('token');
if (token) {
  store.dispatch(fetchUser(token));
}

import { createSlice } from '@reduxjs/toolkit'

const initMemberState = {
  isState: false,
  isUser: [],
}
// localStorage에 저장된 초치값 불러오가
const savedAuth = localStorage.getItem("auth");
// localStorage에 이미 존재하면 state에 저장
const initialState = savedAuth ? JSON.parse(savedAuth) : initMemberState;
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginF: (state, actions) => {
      state.isState = true;
      state.isUser = actions.payload;
      // localStorage에 저장
      localStorage.setItem("auth", JSON.stringify(state));
    },
    logoutF: (state) => {
      state.isState = false;
      state.isUser = [];
      localStorage.removeItem("auth", JSON.stringify(state));
    },
  }
})
export const { loginF, logoutF } = authSlice.actions;
export default authSlice

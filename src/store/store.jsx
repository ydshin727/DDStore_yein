import { configureStore } from '@reduxjs/toolkit'
import cartSlice from '../cart/slice/cartSlice'
import authSlice from '../auth/slice/authSlice'
import paymentSlice from '../payment/slice/paymentSlice'
import communitySlice from '../community/slice/communitySlice'
import communityCommentSlice from '../community/slice/communityCommentSlice'
import notificationSlice from '../payment/slice/notificationSlice'
import communityOrderStoreSlice from '../community/slice/communityOrderStoreSlice'
import communityGradeSlice from '../community/slice/communityGradeSlice'
import itemSlice from '../items/slice/itemSlice'
import authMemberListSlice from '../auth/slice/authMemberListSlice'

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    payment: paymentSlice.reducer,
    community: communitySlice.reducer,
    comment: communityCommentSlice.reducer,
    orderstore: communityOrderStoreSlice.reducer,
    notification: notificationSlice.reducer,
    grade: communityGradeSlice.reducer,
    item: itemSlice.reducer,
    authMember:authMemberListSlice.reducer
  }
})

export default store
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'
import axios from 'axios'

// yein - 결제 Slice

const url = API_JSON_SERVER_URL

// 주문 DB 생성, 장바구니 DB 삭제
export const fetchPayment = createAsyncThunk(
  'payment/fetchPayment',
  async (paymentData, { rejectWithValue }) => {
    // isCartOrder(주문상세/전체)는 orderDB에 안들어가게 빼기
    const { isCartOrder, ...orderData } = paymentData
    try {
      // 1. PaymentOrder에서 받아온 정보를 주문(order) DB에 저장
      const res = await axios.post(`${url}/order`, orderData)
      // 2. 장바구니 결제일 때만 장바구니 DB 삭제
      if (isCartOrder) {
        // 장바구니(carts) DB 조회
        const cartRes = await axios.get(`${url}/carts?userId=${orderData.userId}`)
        const cartItems = cartRes.data
        // 삭제할 아이템이 있을 때만 장바구니 DB 삭제
        if (cartItems.length > 0) {
          try {
            await Promise.all(
              cartItems.map(item => axios.delete(`${url}/carts/${item.id}`))
            )
          } catch (err) {
            alert("장바구니 비우기 실패 (주문은 성공)")
          }
        }
      }
      return res.data
    } catch (error) {
      return rejectWithValue("상품 주문 과정에서 문제가 발생했습니다.")
    }
  }
)

// 주문 내역 가져오기
export const fetchPaymentList = createAsyncThunk(
  'payment/fetchPaymentList',
  async (params, { rejectWithValue }) => {
    const { orderId, userId } = params || {}
    try {
      // 현재 로그인한 id로 주문한 목록만 조회 (주문 상세/전체 목록)
      const query = orderId ? `id=${orderId}&userId=${userId}` : `userId=${userId}`
      const res = await axios.get(`${url}/order?${query}`)
      return res.data
    } catch (error) {
      return rejectWithValue("주문 내역을 가져오는데 실패했습니다.")
    }
  }
)

// 어드민용 주문 내역 가져오기
export const fetchPaymentListAdmin = createAsyncThunk(
  'payment/fetchPaymentListAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/order`)
      return res.data
    } catch (error) {
      return rejectWithValue("주문 내역을 가져오는데 실패했습니다.")
    }
  }
)

// 주문 상태 업데이트 (주문완료, 주문확인, 배송준비, 배송중, 배송완료, 수령완료)
// 사용자는 주문완료일 때 결제취소 가능, 배송중일 때 수령완료 가능
// 나머지 상태 관리는 admin에서 진행
export const updateOrderStatus = createAsyncThunk(
  'payment/updateOrderState',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${url}/order/${orderId}`, {status})
      return res.data
    } catch (error) {
      return rejectWithValue("상태 변경에 실패했습니다.")
    }
  }
)

// 결제 취소 (orderDB 삭제)
export const cancelOrder = createAsyncThunk(
  'payment/cancelOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      await axios.delete(`${url}/order/${orderId}`)
      return orderId
    } catch (error) {
      return rejectWithValue("주문 취소에 실패했습니다.")
    }
  }
)

// 매장 목록(주문처) 가져오기
export const fetchStore = createAsyncThunk(
  'payment/fetchStore',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/orderstore`)
      return res.data
    } catch (error) {
      return rejectWithValue("매장 목록을 불러오는데 실패했습니다.")
    }
  }
)

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    data: [],
    store: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 개별 성공 로직 (fulfilled)
      // fetchPayment는 addMatcher에서 실행되기에 생략함
      .addCase(fetchPaymentList.fulfilled, (state, action) => {
        // 받아온 데이터를 배열로 변환 -> map 에러 방지
        state.data = Array.isArray(action.payload) ? action.payload : [action.payload]
      })
      .addCase(fetchPaymentListAdmin.fulfilled, (state, action) => {
        state.data = Array.isArray(action.payload) ? action.payload : [action.payload]
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        // 기존 데이터 배열에서 수정된 아이템만 교체
        const index = state.data.findIndex(order => order.id === action.payload.id)
        if (index !== -1) {
          state.data[index] = action.payload
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        // 삭제된 데이터 제외
        state.data = state.data.filter(order => order.id !== action.payload)
      })
      .addCase(fetchStore.fulfilled, (state, action) => {
        state.store = action.payload
      })
      // 공통 로직 (pending, fulfilled, rejected)
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true
          state.error = null
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => {
          state.loading = false
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.error = action.payload || "서버 통신 중 에러가 발생했습니다"
        }
      )
  }
})

export default paymentSlice
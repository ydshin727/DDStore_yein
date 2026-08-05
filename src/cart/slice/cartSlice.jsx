import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'

// yein - 장바구니 Slice

const url = API_JSON_SERVER_URL

// 장바구니 DB 불러오기
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/carts?userId=${userId}`)
      return res.data
    } catch (error) {
      return rejectWithValue("장바구니 데이터를 불러오지 못했습니다.")      
    }
  }
)

// 장바구니 추가
export const addCartItem = createAsyncThunk(
  'cart/addCartItem',
  async (item, { rejectWithValue }) => {
    try {
      // 같은 유저, 같은 아이템인 DB 불러오기
      const res = await axios.get(`${url}/carts?userId=${item.userId}&itemId=${item.itemId}`)
      // 그중에서 옵션(색상, 사이즈)까지 같은 DB 가져오기
      const existing = res.data.find(cart =>
        cart.color === item.color && cart.size === item.size
      )
      // 장바구니에 옵션까지 똑같은 물건이 있다면 수량만 증감
      if (existing) {
        const patchRes = await axios.patch(
          `${url}/carts/${existing.id}`, 
          { count: existing.count + item.count }
        )
        return patchRes.data
      }
      // 장바구니에 해당 물건이 없다면(옵션이 하나라도 다르면) 추가
      const postRes = await axios.post(`${url}/carts`, item)
      return postRes.data
    } catch (err) {
      return rejectWithValue("장바구니 추가에 실패했습니다.")
    }
  }
)

// 수량 변경
export const patchCartCount = createAsyncThunk(
  'cart/patchCartCount',
  async ({ cartId, count }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${url}/carts/${cartId}`, { count })
      return res.data
    } catch (err) {
      return rejectWithValue("수량 변경에 실패했습니다.")
    }
  }
)

// 옵션 변경
export const patchCartOption = createAsyncThunk(
  'cart/patchCartOption',
  async ({ cartId, color, size }) => {
    try {
      const res = await axios.patch(`${url}/carts/${cartId}`, { color, size })
      return res.data
    } catch (error) {
      return rejectWithValue("옵션 변경에 실패했습니다.")
    }
  }
)

// 장바구니 삭제
export const deleteCartItem = createAsyncThunk(
  'cart/deleteCartItem',
  async (cartId, { rejectWithValue }) => {
    try {
      await axios.delete(`${url}/carts/${cartId}`)
      return cartId
    } catch (err) {
      return rejectWithValue("아이템 삭제에 실패했습니다.")
    }
  }
)

// 장바구니 추가/수량 변경 업데이트 함수
const updateCartItem = (state, action) => {
  const updated = action.payload
  const index = state.data.findIndex(item => item.id === updated.id)
  if (index !== -1) {
    // 장바구니에 있으면 해당 index의 데이터 교체
    state.data[index] = updated
  } else {
    // 장바구니에 없으면 새로 추가 (addCartItem)
    state.data.push(updated)
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { 
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    clearCart: (state) => {
      state.data = []
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // 개별 성공 로직 (fulfilled)
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.data = action.payload
      })
      .addCase(addCartItem.fulfilled, updateCartItem)
      .addCase(patchCartCount.fulfilled, updateCartItem)
      .addCase(patchCartOption.fulfilled, (state, action) => {
        const index = state.data.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.data[index] = action.payload
        }
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        // 삭제된 데이터 제외
        state.data = state.data.filter(item => item.id !== action.payload)
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

export const { clearCart } = cartSlice.actions

export default cartSlice
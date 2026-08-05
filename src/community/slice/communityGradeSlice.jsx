import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import React from 'react'
import { API_JSON_SERVER_URL } from '../../apis/commonApi'
import { getUserGrade } from '../components/common/CommunityUtils'
import axios from 'axios'

// 사용자 등급가져오기 또는 업데이트
export const updateOrFetchGrade = createAsyncThunk(
  'grade/updateOrFetchGrade',
  async ({ userId, userName, addPrice }, { rejectWithValue }) => {
    try {
      //사용자 구매내역중 '배송완료'상태 가져오기
      const res = await axios.get(`${API_JSON_SERVER_URL}/order?userId=${String(userId)}&status=배송완료&status=수령완료`)

      // 배송완료 + 주문내역(totalPrice) 합산(반품시 알아서계산)
      const totalSpent = res.data.reduce((sum, order) => {
        return sum + Number(order.totalPrice || 0)
      }, 0);

      const newGrade = getUserGrade(totalSpent).label;

      // grade 테이블 최신화
      const gradeRes = await axios.get(`${API_JSON_SERVER_URL}/grades?userId=${String(userId)}`)
      const existingData = gradeRes.data[0]

      if (existingData) {
        const update = await axios.patch(`${API_JSON_SERVER_URL}/grades/${existingData.id}`, {
          totalSpent: totalSpent,
          currentGrade: newGrade,
          userName: userName
        })
        return update.data

      } else {
        //데이터없으면 신규생성(totalSpent우선사용 (없으면addPrice))
        const finalSpent = totalSpent > 0 ? totalSpent : Number(addPrice || 0)
        const initialGrade = getUserGrade(finalSpent).label
        const newUserGrade = await axios.post(`${API_JSON_SERVER_URL}/grades`, {
          userId: String(userId),
          userName,
          totalSpent: finalSpent,
          currentGrade: initialGrade
        })
        return newUserGrade.data
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

//모든사용자등급목록 가져오기
export const fetchAllGrades = createAsyncThunk(
  'grade/fetchAllGrades',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_JSON_SERVER_URL}/grades`);
      return res.data; // 서버의 전체 등급 배열 반환
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const communityGradeSlice = createSlice({
  name: 'grade',
  initialState: {
    userGrades: [], //모든 사용자 등급목록 (게시판용)
    myGrade: null, //내 등급정보
    loading: false,
    error: null
  },



  reducers: {},



  extraReducers: (builder) => {
    builder
      .addCase(updateOrFetchGrade.pending, (state) => {
        state.loading = true
      })
      .addCase(updateOrFetchGrade.fulfilled, (state, action) => {
        state.myGrade = action.payload
        state.loading = false
        state.error = null
      })
      .addCase(updateOrFetchGrade.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload //실패시 에러저장
      })
      //뱃지 등급 업데이트
      .addCase(fetchAllGrades.fulfilled, (state, action) => {
        state.userGrades = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllGrades.pending, (state) => {
        state.loading = true;
      });
  }
})


export default communityGradeSlice
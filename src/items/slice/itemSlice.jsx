import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import React from 'react'
import { API_JSON_SERVER_URL } from '../../apis/commonApi';
import axios from 'axios';

const initItemState = {
  data: []
}

const url = API_JSON_SERVER_URL;

// 아이템리스트를 호출하기 위한 async청크
export const fetchItemList = createAsyncThunk(
  'item/fetchItemList',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${url}/items`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
// 아이템을 추가하기 위한 async청크
export const postItem = createAsyncThunk(
  'item/postItem',
  async (data , { rejectWithValue }) => {
    try {
      const dataAdd = await axios.post(`${url}/items`, data);
      console.log(dataAdd);
      return dataAdd.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
// 아이템을 삭제하기 위한 async청크
export const deleteItem = createAsyncThunk(
  'item/deleteItem',
  async (id , { rejectWithValue }) => {
    try {
      const dataDel = await axios.delete(`${url}/items/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
// 아이템을 수정하기 위한 async청크
export const putItem = createAsyncThunk(
  'item/putItem',
  async (data , { rejectWithValue }) => {
    try {
      const dataPut = await axios.put(`${url}/items/${data.id}`,data);
      return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const itemSlice = createSlice({
  name: 'item',
  initialState: initItemState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 완료되면 data에 아이템리스트 저장
      .addCase(fetchItemList.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      // 완료되면 data에 변경사항 적용
      .addCase(postItem.fulfilled, (state, action) => {
        // 추가사항이므로 기존 data배열의 길이에 맞춰 추가
        state.data[state.data.length] = action.payload;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        // filter로 삭제한 id제외한 데이터를 넣음
        state.data = state.data.filter(item => item.id !== action.payload)
      })
      .addCase(putItem.fulfilled, (state, action) => {
        state.data = state.data.map((el,idx)=>{
          // 수정한 id만 체크해서 수정데이터 넣기
          if(el.id === action.payload.id){
            return action.payload;
          }else{
            return el;
          }
        })
      })
  }
})

export default itemSlice

import React, { useRef, useState } from 'react'
import '../css/adminProductAdd.css'
import { useDispatch, useSelector } from 'react-redux';
import { postItem } from '../../items/slice/itemSlice';
import { checkData, checkNotData } from '../../auth/components/AuthCommonFn';

// 제품 추가 초기화용 변수
const initProduct = {
  name: '',
  price: 0,
  image: 'placeholder.png',
  category: 'fashion',
  isBest: false
}

const AdminProductAdd = () => {
  // 제품추가 데이터를 담기위한 변수
  const [product, setProduct] = useState(initProduct);
  const { data: allProduct } = useSelector(state => state.item);

  // 이름이 겹칠때 포커싱을 하기위한 ref설정
  const inputRef = useRef(null);

  // 외부함수를 불러오기위한 dispatch 변수
  const dispatch = useDispatch();
  // 공통 onchange함수
  const onChangeFn = (e) => {
    const { name, value, type } = e.target;
    setProduct({ ...product, [name]: type === 'number' ? Number(value) : value });
  }
  // 추가버튼 함수
  const onAddFn = (e) => {
    // commonFn에서 가져온 함수(정보가 있는지 체크)
    if (checkNotData(product) !== undefined) {
      alert('정보가 비어있습니다.');
      return;
    }
    const agree = confirm('아이템을 추가하시겠습니까?');
    if (!agree) return;
    // commonFn에서 가져온 함수(중복되있는게 있는지 체크)
    if (checkData('items', product, allProduct)) {
      alert('중복되는 이름의 아이템입니다.');
      return;
    }
    // 아이템추가 비동기함수 호출
    dispatch(postItem(product));
    alert('아이템이 추가되었습니다.');
    // 아이템 추가 후 기존 데이터 초기화(현재 페이지)
    setProduct(initProduct);
  }
  return (
    <div className="adminProductAdd">
      <div className="adminProductAdd-con">
        <ul>
          <li><h1>아이템 추가</h1></li>
          <li>
            <label>category</label>
            <span><select name="category" id="category"
              value={product.category} onChange={onChangeFn}>
              <option value="fashion">패션</option>
              <option value="feed">사료/간식</option>
              <option value="living">생활용품</option>
              <option value="toy">장난감</option>
            </select></span>
          </li>
          <li>
            <span>name</span>
            <span><input type="text" id='name' name='name'
              onChange={onChangeFn} value={product.name}
              ref={inputRef} /></span>
          </li>
          <li>
            <span>price</span>
            <span><input type="number" id='price' name='price'
              onChange={onChangeFn} value={product.price}
              ref={inputRef} /></span>
          </li>
          <li>
            <span><img src={`/images/items_juhee/${product.image}`} alt={product.image} /></span>
            <span>
              <select name="image" id="image"
                onChange={onChangeFn} defaultValue="placeholder.png"
                ref={inputRef}>
                <option value="placeholder.png" disabled hidden>이미지를 골라주세요</option>
                {allProduct && allProduct.map((el, idx) => {
                  return (
                    <option value={el.image} key={idx}>{el.image}</option>
                  )
                })}
              </select>
            </span>
          </li>
          <li>
            <button onClick={() => onAddFn()}>추가</button>
          </li>
        </ul>
      </div>
    </div>
  )

}

export default AdminProductAdd

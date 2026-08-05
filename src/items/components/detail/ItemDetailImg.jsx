import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import '../../css/itemDetailImg.css'
import { API_JSON_SERVER_URL } from '../../../apis/commonApi'

const ItemDetailImg = () => {
  const url= API_JSON_SERVER_URL
  const { id } = useParams()
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    fetch(`${url}/itemDetails?id=${id}`)
      .then(res => res.json())
      .then(data => {
        setDetail(data[0]) // ✅ 배열 → 객체
      })
  }, [id])

  if (!detail || !detail.descriptionImages?.length) return null

  return (
    <div className="item-detail">
{detail.descriptionImages.map((img, index) => (
  <img
    key={index}
    src={img}
    alt={`상세이미지-${index}`}
    className="detail-image"
  />
))}
    </div>
  )
}

export default ItemDetailImg

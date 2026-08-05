import React, { useState } from 'react'


// ==========        글자수 제한 훅      ==================
const useTextLimit = (initialValue = '', maxLength = 100) => {
  const [value, setValue] = useState(initialValue)
  const currentLength = value ? value.length : 0;

  const handleChange = (e) => {
    const { value: inputValue } = e.target

    // 글자수 넘어가지않을때만 상태업데이트
    if (inputValue.length <= maxLength) {
      setValue(inputValue)
    } else {
      alert(`최대 ${maxLength}까지 가능합니다.`)
    }
  }

  const resetValue = () => setValue("")

  return {
    value,
    setValue,
    handleChange,
    resetValue,
    currentLength: value.length,
    maxLength,
    isLimit: value.length >= maxLength //최대치
  }

}

export default useTextLimit
// 데이터 중복을 체크하는 함수
export const checkData = (keyword, userData, allData) => {
  switch (keyword) {
    case 'userEmail':
      return allData.find(
        el => el.userEmail === userData.userEmail
      )
    case 'items':
      return allData.find(
        el => el.name === userData.name
      )
    case 'userPw':
      return allData.userPw === userData.userPw;
  }
}

// 정규식 체크 코드
// 출처 https://velog.io/@qazx960/React-TypeScript-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EC%9C%A0%ED%9A%A8%EC%84%B1-%EA%B2%80%EC%82%AC

//이메일 포멧
export const emailRegEx = /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

// 최소 8 자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자 :
export const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,16}$/;

// 이메일 체크
export const validateEmail = (email) => {
  if (!emailRegEx.test(email)) {
    
    return true;
  } else {
    return false;
  }
};

// 패스워드 체크
export const validatePass = (password) => {
  if (!passwordRegex.test(password)) {
    alert("비밀번호 형식이 맞지 않습니다.");
    return true;
  } else {
    return false;
  }
};

// 데이터를 작성시 비어있는 데이터가 있는지 체크하는 함수
export const checkNotData = (data) => {
  return Object.keys(data).find(el => data[el] === '');
} 
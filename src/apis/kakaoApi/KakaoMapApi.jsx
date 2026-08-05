import React, { useEffect, useRef } from 'react';

const KakaoMapApi = ({ lat, lng, name, onSelect }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null) // 지도객체 보관Ref
  const markerRef = useRef(null) //마커객체 보관Ref
  const apiKey = import.meta.env.VITE_API_KEY;
  
  useEffect(() => {
    const initializeMap = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;


        //지도 초기화 
        const options = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapContainer.current, options);
        mapRef.current = map

        //마커 초기화
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(lat, lng),
          map: map
        });
        markerRef.current = marker  //생성된 마커객체를 Ref에 저장해야 위치를옮길수있다


        //주소 변환 객체 생성
        const geocoder = new window.kakao.maps.services.Geocoder()
        //지도 클릭 이벤트
        window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
          const clickedLatLng = mouseEvent.latLng

          // 마커위치 클릭위치로 이동
          marker.setPosition(clickedLatLng)

          // 좌표를 주소로 변환 (역 지오코딩)
          geocoder.coord2Address(clickedLatLng.getLng(), clickedLatLng.getLat(), (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const addr = result[0].address.address_name //지번 또는 도로명

              //부모 컴포넌트로 주소,좌표 전달
              if (onSelect) {
                onSelect({
                  address: addr,
                  lat: clickedLatLng.getLat(),
                  lng: clickedLatLng.getLng()
                })
              }
            }
          })
        })
      });
    };

    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
      script.async = true;
      document.head.appendChild(script);
      script.onload = () => initializeMap();
    } else {
      initializeMap();
    }
  }, []); // 초기 로드시 1회


  // lat,lng 바뀔때마다 실행
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const moveLation = new window.kakao.maps.LatLng(lat, lng)

      //지도 중심이동
      mapRef.current.panTo(moveLation)
      //마커 위치갱신
      markerRef.current.setPosition(moveLation)
    }
  }, [lat, lng])

  // 컴포넌트의 반환값
  return <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: '200px' }} />;
};

// export 문은 반드시 함수 블록 바깥, 파일의 최하단에 위치해야 합니다.
export default KakaoMapApi;
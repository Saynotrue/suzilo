let currentUse = true;
let pulseMarker = null; // 마커를 새로 생성할 수 있도록 변수 선언

$('#current').click(() => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const latlng = new naver.maps.LatLng(lat, lng);
            
            // 기존에 위치 정보 마커가 있을 경우 삭제
            if (pulseMarker) {
                pulseMarker.setMap(null); 
            }

            // 새로운 마커 생성
            if (currentUse) {
                pulseMarker = new naver.maps.Marker({
                    map: map,
                    position: latlng,
                    icon: {
                        content: '<div class="shadow-marker"></div><div class="pulse-marker"></div>',
                        anchor: new naver.maps.Point(12, 12),
                    }
                });
            }

            currentUse = false;
            map.setZoom(14, false);  // 줌 레벨 설정
            map.panTo(latlng);  // 지도 중앙 이동
        });
    } else {
        alert("위치 정보 사용 불가능");
    }
});

// getRedirectUrl 함수는 루프 외부로 이동하여 효율적으로 처리
function getRedirectUrl(address) {
    return `https://namu.wiki/w/${encodeURIComponent(address)}`;
}

// 서버로부터 위치 정보 가져오기
$.ajax({
    url: "/location",
    type: "GET"
}).done((response) => {
    if (response.message !== "success") return;

    const data = response.data;
    const markerList = [];
    const infowindowList = [];

    data.forEach((target, i) => {
        const latlng = new naver.maps.LatLng(target.lat, target.lng);

        // plv 값에 따른 색상 결정
        const markerColors = {
            "보통": "green",
            "약간나쁨": "yellow",
            "나쁨": "red"
        };
        const markerColor = markerColors[target.plv] || "gray";

        const marker = new naver.maps.Marker({
            map: map,
            position: latlng,
            icon: {
                content: `<div class="marker" style="background-color:${markerColor};"></div>`,
                anchor: new naver.maps.Point(7.5, 7.5),
            },
        });

        const content = `
        <div class="infowindow_wrap">
            <div class="infowindow_title">${target.title}</div>
            <div class="infowindow_address">대권역: <a href="${getRedirectUrl(target.address)}" target="_blank">${target.address}</a></div>
            <div class="infowindow_area">T-N: ${target.tn} mg/kg</div>
            <div class="infowindow_area">아이오딘: ${target.iodine} Bq/L</div>
            <div class="infowindow_area">최고수심: ${target.mlv} m</div>
            <div class="infowindow_area">표층수심: ${target.slv} m</div>
            <div class="infowindow_area">표층 pH: ${target.spH}</div>
            <div class="infowindow_area">오염단계: ${target.plv}</div>
        </div>
        `;

        const infowindow = new naver.maps.InfoWindow({
            content: content,
            backgroundColor: "#00ff0000",
            borderColor: "00ff0000",
            anchorSize: new naver.maps.Size(0, 0),
        });

        markerList.push(marker);
        infowindowList.push(infowindow);

        // 마커 클릭 시 인포윈도우만 표시
        naver.maps.Event.addListener(marker, "click", () => {
            if (infowindow.getMap()) {
                infowindow.close();
            } else {
                infowindow.open(map, marker);
            }
        });

        // 맵 클릭 시 인포윈도우 닫기
        naver.maps.Event.addListener(map, "click", (e) => {
            if (!e.target.getElement()) {  // 지도 클릭 시 마커 클릭이 아닌 경우만
                infowindow.close();
            }
        });
    });

    const clusterStyles = [
        { content: '<div class="cluster1"></div>' },
        { content: '<div class="cluster2"></div>' },
        { content: '<div class="cluster3"></div>' }
    ];

    new MarkerClustering({
        minClusterSize: 2,
        maxZoom: 12,
        map: map,
        markers: markerList,
        disableClickZoom: false,
        gridSize: 50,
        icons: clusterStyles,
        indexGenerator: [2, 5, 10],
        stylingFunction: (clusterMarker, count) => {
            $(clusterMarker.getElement()).find("div:first-child").text(count);
        },
    });
});

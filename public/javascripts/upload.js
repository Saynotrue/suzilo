const mapContainer = document.getElementById("map");
const mapOption = {
    center: new daum.maps.LatLng(37.373926, 126.732362),
    level: 3,
};

let map = new daum.maps.Map(mapContainer, mapOption);

let infowindow = new daum.maps.InfoWindow({
    zIndex: 1,
});

let markerList = [];

let ps = new daum.maps.services.Places();

searchPlaces();

function searchPlaces() {
    let keyword = $("#keyword").val();
    ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status) {
    if (status === daum.maps.services.Status.OK) {
        displayPlaces(data);
    } else if (status === daum.maps.services.Status.ZERO_RESULT) {
        alert("검색 결과가 존재하지 않습니다");
        return;
    } else if (status === daum.maps.services.Status.ERROR) {
        alert("검색 중 오류가 발생했습니다.");
        return;
    }
}

function displayPlaces(data) {
    let listEl = document.getElementById("placesList");
    let bounds = new daum.maps.LatLngBounds();

    removeAllChildNodes(listEl);
    removeMarker();

    for (let i = 0; i < data.length; i++) {
        let lat = data[i].y;
        let lng = data[i].x;
        let address_name = data[i]["address_name"];
        let place_name = data[i]["place_name"];

        const placePosition = new daum.maps.LatLng(lat, lng);
        bounds.extend(placePosition);

        let marker = new daum.maps.Marker({
            position: placePosition,
        });

        marker.setMap(map);
        markerList.push(marker);

        const el = document.createElement("div");
        const itemStr = `
            <div class="info">
                <div class="info_title">
                ${place_name}
                </div>
                <span>${address_name}</span> 
            </div>
        `;

        el.innerHTML = itemStr;
        el.className = "item";

        daum.maps.event.addListener(marker, "click", function () {
            displayInfowindow(marker, place_name, address_name, lat, lng);
        });

        daum.maps.event.addListener(map, "click", function () {
            infowindow.close();
        });

        el.onclick = function () {
            displayInfowindow(marker, place_name, address_name, lat, lng);
        };

        listEl.appendChild(el);

    }
    map.setBounds(bounds);
}

function displayInfowindow(marker, place_name, address_name, lat, lng) {
    let content = `
    <div style="padding:25px;">
        ${place_name}<br>
        ${address_name}<br>
        <button onClick="onSubmit('${place_name}','${address_name}',${lat},${lng})">등록</button>
        <br>
    </div>
    `;
    map.panTo(marker.getPosition());
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

function removeAllChildNodes(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

function removeMarker() {
    for (let i = 0; i < markerList.length; i++) {
        markerList[i].setMap(null);
    }
    markerList = [];
}

function onSubmit(title,address,lat,lng) {
    $.ajax({
        url:"/location",
        data:{title,address,lat,lng},
        type:"POST",
    }).done((response)=>{
        console.log("Data Request Success");
        alert("성공");
    }).fail((error)=>{
        console.log("Data Request Fail");
        alert("실패");
    });
}
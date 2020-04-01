/* eslint-disable */
console.log('from client side');

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
	// 'pk.eyJ1IjoidGhlcGhlbm9tZW5hbCIsImEiOiJjazhnbmtnYWMwMnNyM3FwZWt5dTYxOXRuIn0.ZmULmQOODizASmTiW_VI4g';
	'pk.eyJ1IjoidGhlcGhlbm9tZW5hbCIsImEiOiJjazhnbmtnYWMwMnNyM3FwZWt5dTYxOXRuIn0.ZmULmQOODizASmTiW_VI4g';
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/thephenomenal/ck8go3hma1d0q1iqp7vfoxzsv',
	scrollZoom: false
	// zoom: 1
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
	//add marker
	const el = document.createElement('div');
	el.className = 'marker';

	//add the marker
	new mapboxgl.Marker({
		element: el,
		anchor: 'bottom'
	})
		.setLngLat(loc.coordinates)
		.addTo(map);

	//add popup
	new mapboxgl.Popup({
		offset: 30
	})
		.setLngLat(loc.coordinates)
		.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
		.addTo(map);
	//extends the map bounds to include the cuurent location
	bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
	padding: {
		top: 200,
		bottom: 150,
		left: 100,
		right: 100
	}
});

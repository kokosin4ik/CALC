import React from "react";


import L from 'leaflet';

// import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import './MapView.css';


export default class MapView extends React.Component {
  
  componentDidMount() {
    // create map
    this.mymap = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      id: 'mapbox.streets',
      // accessToken: 'your.mapbox.access.token'
    }).addTo(this.mymap);
    
    var marker = L.marker([51.5, -0.09]).addTo(this.mymap);
    marker.bindPopup("<b>Hello world!</b><br>You are here.").openPopup();
    
  }
  render() {
    
    return <div id="map"></div>
  }
}

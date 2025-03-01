import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Button, Form } from 'react-bootstrap';
import Map from './components/Map';
import ShelterList from './components/ShelterList';
import SafetyInfo from './components/SafetyInfo';
import GoogleMap from './components/GoogleMap';

//local storage and API Key: key should be entered in by the user and will be stored in local storage (NOT session storage)
let keyData = "";
const saveKeyData = "MYKEY";
const prevKey = localStorage.getItem(saveKeyData); //so it'll look like: MYKEY: <api_key_value here> in the local storage when you inspect
if (prevKey !== null) {
  keyData = JSON.parse(prevKey);
}

function App() {
  const [key, setKey] = useState<string>(keyData); //for api key input
  
  //sets the local storage item to the api key the user inputed
  function handleSubmit() {
    localStorage.setItem(saveKeyData, JSON.stringify(key));
    window.location.reload(); //when making a mistake and changing the key again, I found that I have to reload the whole site before openai refreshes what it has stores for the local storage variable
  }

  //whenever there's a change it'll store the api key in a local state called key but it won't be set in the local storage until the user clicks the submit button
  function changeKey(event: React.ChangeEvent<HTMLInputElement>) {
    setKey(event.target.value);
  }
  return (
    <Router>
      <div className="App">
        
        <div className="map-box">
            <GoogleMap />
        </div>

        <div className="tab-bar"></div>

        <div className="directions-box">Directions go this way or something</div>

        <div className="supplies-box">Reasources go here or something</div>

        <div className="information-box">Information about the disaster</div>
        
        <Routes>
          <Route path="/map" element={<Map />} />
          <Route path="/shelters" element={<ShelterList />} />
          <Route path="/safety-info" element={<SafetyInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

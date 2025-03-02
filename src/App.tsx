import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Button, Form } from 'react-bootstrap';
import Map from './components/Map';
import ShelterList from './components/ShelterList';
import SafetyInfo from './components/SafetyInfo';
import GoogleMap from './components/GoogleMap';
import DisasterPrompt from './components/DisasterPrompt';

//local storage and API Key: key should be entered in by the user and will be stored in local storage (NOT session storage)
let keyData = "";
const saveKeyData = "MYKEY";
const prevKey = localStorage.getItem(saveKeyData); //so it'll look like: MYKEY: <api_key_value here> in the local storage when you inspect
if (prevKey !== null) {
  keyData = JSON.parse(prevKey);
}

function App() {
  const [key, setKey] = useState<string>(keyData); //for api key input
  const [disasterType, setDisasterType] = useState<string>(''); // for disaster type
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // for showing the disaster prompt
  const [slectedTab, setSelectedTab] = useState(1);

  useEffect(() => {
    setShowPrompt(true); // Show the prompt when the component mounts
  }, []);

  const handleDisasterSelect = (selectedDisaster: string) => {
    setDisasterType(selectedDisaster);
    setShowPrompt(false);
  };

  const selectTab = (selectedTab: number) => {
    setSelectedTab(selectedTab);
  }

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
        
        <DisasterPrompt show={showPrompt} onClose={handleDisasterSelect} />

        <div className="map-box">
          {disasterType && disasterType !== 'Earthquake' && disasterType !== 'Wildfire' && disasterType !== 'Hurricane' && disasterType !== 'Blizzard' && disasterType !== 'Power Plant Meltdown' && (
            <GoogleMap disasterType={disasterType} />
          )}
        </div>

        <div className="disaster-type">
          <Form>
            <Form.Label>Disaster Type:</Form.Label>
            <Form.Control as="select" onChange={(e) => setDisasterType(e.target.value)}>
              <option value="">Select a disaster type</option>
              <option value="Blizzard">Blizzard</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Flood">Flood</option>
              <option value="Hurricane/Tornado">Hurricane/Tornado</option>
              <option value="Power Plant Meltdown">Power Plant Meltdown</option>
              <option value="Wildfire">Wildfire</option>
            </Form.Control>
          </Form>
        </div>

        <div className="tab-bar">
          <div className="tab-button" style={{backgroundColor: slectedTab === 1 ? "gray" : "black"}} onClick={()=>selectTab(1)}></div>
          <div className="tab-button" style={{backgroundColor: slectedTab === 2 ? "gray" : "black"}} onClick={()=>selectTab(2)}></div>
          <div className="tab-button" style={{backgroundColor: slectedTab === 3 ? "gray" : "black"}} onClick={()=>selectTab(3)}></div>
        </div>

        <div className="directions-box">Directions go this way or something</div>

        <div className="information-box">Information about the disaster</div>

        <Routes>
          <Route path="/map" element={<Map disasterType={disasterType} />} />
          <Route path="/shelters" element={<ShelterList />} />
          <Route path="/safety-info" element={<SafetyInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

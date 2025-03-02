import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Button, Form, Accordion } from 'react-bootstrap';
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

  useEffect(() => {
    setShowPrompt(true); // Show the prompt when the component mounts
  }, []);

  const handleDisasterSelect = (selectedDisaster: string) => {
    setDisasterType(selectedDisaster);
    setShowPrompt(false);
  };

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
      <div className='content-wrapper'>
        <div className="App">
          <DisasterPrompt show={showPrompt} onClose={handleDisasterSelect} />
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
        </div>
        <div className='content-wrapper'>
          <div className="map-box">
            {disasterType && disasterType !== 'Earthquake' && disasterType !== 'Wildfire' && disasterType !== 'Hurricane' && disasterType !== 'Blizzard' && disasterType !== 'Power Plant Meltdown' && (
              <GoogleMap disasterType={disasterType} />
            )}
          </div>
        </div>
        <div className="content-wrapper">
          <div className="accordion-wrapper">
            <Accordion defaultActiveKey="0" className="accordion-sections">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Directions</Accordion.Header>
                <Accordion.Body>
                  <div className="directions-box">Directions go this way or something</div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Resources</Accordion.Header>
                <Accordion.Body>
                  <ShelterList />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>Mitigation</Accordion.Header>
                <Accordion.Body>
                  <SafetyInfo />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
        <div className="Contacts-box">
          <h1>Contact Numbers:</h1>
          <p>Delaware Emergency Services: (610) 565-8700</p>
          <p>Emergency: 911</p>
          <p> Non-Emergency: 311</p>
          <p>Red Cross: (800) 733-2767</p>
          <p>Salvation Army: (800) 725-2769</p>
        </div>

        <Routes>
          <Route path="/shelters" element={<ShelterList />} />
          <Route path="/safety-info" element={<SafetyInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

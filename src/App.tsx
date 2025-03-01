import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Button, Form, Tab, Tabs } from 'react-bootstrap';
import Map from './components/Map';
import ShelterList from './components/ShelterList';
import SafetyInfo from './components/SafetyInfo';
import GoogleMap from './components/GoogleMap';
import DisasterPrompt from './components/DisasterPrompt';
import { GoogleGenerativeAI } from "@google/generative-ai";

//local storage and API Key: key should be entered in by the user and will be stored in local storage (NOT session storage)
let keyData = "";
const saveKeyData = "MYKEY";
const prevKey = localStorage.getItem(saveKeyData); //so it'll look like: MYKEY: <api_key_value here> in the local storage when you inspect
if (prevKey !== null) {
  keyData = JSON.parse(prevKey);
}

async function App() {
  const [key, setKey] = useState<string>(keyData); //for api key input
  const [disasterType, setDisasterType] = useState<string>('default'); // for disaster type
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // for showing the disaster prompt
  const [suppliesResults, setSuppliesResults] = useState<string>("");
  const [directionsResults, setDirectionsResults] = useState<string>(""); 
  const [preventionResults, setPreventionResults] = useState<string>("");

  useEffect(() => {
    setShowPrompt(true); // Show the prompt when the component mounts
  }, []);

  const handleDisasterSelect = (selectedDisaster: string) => {
    setDisasterType(selectedDisaster);
    setShowPrompt(false);
  };

  const genAI = new GoogleGenerativeAI("YOUR_API_KEY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  //Supplies, directions, prevention
  const suppliesPrompt = "The disaster was" + {disasterType} + ". List the supplies needed";
  const directionsPrompt = "The disaster was" + {disasterType} + ". List the directions to the nearest shelter";
  const preventionPrompt = "The disaster was" + {disasterType} + ". List the prevention methods";

  const suppliesResponse = model.generateContent(suppliesPrompt);
  const directionsResponse = model.generateContent(directionsPrompt);
  const preventionResponse = model.generateContent(preventionPrompt);

  setSuppliesResults((await suppliesResponse).response.text());
  setDirectionsResults((await directionsResponse).response.text());
  setPreventionResults((await preventionResponse).response.text());

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
        <header className="App-header">
          <div style={{ height: '50vh', width: '80%' }}>
            <GoogleMap disasterType={disasterType} />
          </div>
          
        </header>
        <div className="disaster-type">
          <Form>
            <Form.Label>Disaster Type:</Form.Label>
            <Form.Control as="select" onChange={(e) => setDisasterType(e.target.value)}>
              <option value="default">Default</option>
              <option value="flood">Flood</option>
              <option value="earthquake">Earthquake</option>
              {/* Add more disaster types as needed */}
            </Form.Control>
          </Form>
        </div>

        <div className="map-box">
            <GoogleMap />
        </div>

        <div className="tab-bar"></div>

        <div className="directions-box">Directions go this way or something</div>

        <div className="supplies-box">Reasources go here or something</div>

        <div className="information-box">Information about the disaster</div>

        <Routes>
          <Route path="/map" element={<Map disasterType={disasterType} />} />
          <Route path="/shelters" element={<ShelterList />} />
          <Route path="/safety-info" element={<SafetyInfo />} />
        </Routes>
        <Tabs defaultActiveKey = "supplies" id = "disaster-info-tabs" className = "mb-3">
          <Tab eventKey = "supplies" title = "Supplies">
            {suppliesResults}
          </Tab>
          <Tab eventKey = "directions" title = "Directions">
            {directionsResults}
          </Tab>
          <Tab eventKey = "prevention" title = "Prevention">
            {preventionResults}
          </Tab>
        </Tabs>
      </div>
    </Router>
  );
}

export default App;

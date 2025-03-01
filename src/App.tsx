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
import dotenv from 'dotenv';

//local storage and API Key: key should be entered in by the user and will be stored in local storage (NOT session storage)
let keyData = "";
const saveKeyData = "MYKEY";
const prevKey = localStorage.getItem(saveKeyData); //so it'll look like: MYKEY: <api_key_value here> in the local storage when you inspect
if (prevKey !== null) {
  keyData = JSON.parse(prevKey);
}



function App() {
  const [key, setKey] = useState<string>(keyData); //for api key input
  const [disasterType, setDisasterType] = useState<string>('default'); // for disaster type
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // for showing the disaster prompt
  const [suppliesResults, setSuppliesResults] = useState<string>("");
  const [directionsResults, setDirectionsResults] = useState<string>(""); 
  const [preventionResults, setPreventionResults] = useState<string>("");
  const apiKey = process.env.API_KEY;
  const [slectedTab, setSelectedTab] = useState(1);

  useEffect(() => {
    setShowPrompt(true); // Show the prompt when the component mounts
  }, []);

  const handleDisasterSelect = (selectedDisaster: string) => {
    setDisasterType(selectedDisaster);
    setShowPrompt(false);
  };

  useEffect(() => {
    if (disasterType !== 'default') {
      const fetchData = async () => {
        if (!apiKey) {
          console.error("API key is missing");
          return;
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const suppliesPrompt = `The disaster was ${disasterType}. List the supplies needed.`;
        const directionsPrompt = `The disaster was ${disasterType}. List the directions to the nearest shelter.`;
        const preventionPrompt = `The disaster was ${disasterType}. List the prevention methods.`;

        const suppliesResponse = await model.generateContent(suppliesPrompt);
        const directionsResponse = await model.generateContent(directionsPrompt);
        const preventionResponse = await model.generateContent(preventionPrompt);

        setSuppliesResults(suppliesResponse.response.text());
        setDirectionsResults(directionsResponse.response.text());
        setPreventionResults(preventionResponse.response.text());
      };

      fetchData();
    }
  }, [disasterType, key]);

  
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
            <GoogleMap disasterType={disasterType} />
        </div>

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

        <div className="tab-bar">
          <div className="tab-button" style={{backgroundColor: slectedTab === 1 ? "darkgray" : "gray"}} onClick={()=>selectTab(1)}></div>
          <div className="tab-button" style={{backgroundColor: slectedTab === 2 ? "darkgray" : "gray"}} onClick={()=>selectTab(2)}></div>
          <div className="tab-button" style={{backgroundColor: slectedTab === 3 ? "darkgray" : "gray"}} onClick={()=>selectTab(3)}></div>
        </div>

        <div className="directions-box">Directions go this way or something</div>

        <div className="Contacts-box">
          <h1>Contact Numbers:</h1>
          <p>Delaware Emergency Services: (610) 565-8700</p>
          <p>Emergency: 911</p>
          <p> Non-Emergency: 311</p>
          <p>Red Cross: (800) 733-2767</p>
          <p>Salvation Army: (800) 725-2769</p>
          </div>

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

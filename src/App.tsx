import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Accordion } from 'react-bootstrap';
import ShelterList from './components/ShelterList';
import SafetyInfo from './components/SafetyInfo';
import GoogleMap from './components/GoogleMap';
import DisasterPrompt from './components/DisasterPrompt';
import { GoogleGenerativeAI } from "@google/generative-ai";
import myImage from './components/salem-evac.jpg';

//local storage and API Key: key should be entered in by the user and will be stored in local storage (NOT session storage)
let keyData = "";
const saveKeyData = "MYKEY";
const prevKey = localStorage.getItem(saveKeyData); //so it'll look like: MYKEY: <api_key_value here> in the local storage when you inspect
if (prevKey !== null) {
  keyData = JSON.parse(prevKey);
}

function App() {
  const [key] = useState<string>(keyData); //for api key input
  const [disasterType, setDisasterType] = useState<string>(''); // for disaster type
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // for showing the disaster prompt
  const [suppliesResults, setSuppliesResults] = useState<string>("");
  const [directionsResults, setDirectionsResults] = useState<string>(""); 
  const [preventionResults, setPreventionResults] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [closestLocation, setClosestLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  console.log("Preparing apiKey");
  const apiKey = 'AIzaSyAYfmTy4J6wwJT8DMj6XkU3cbi-ML56mmg'; // Provide a default value
  console.log("apiKey set to: " + apiKey);

  //Gemini API get and response
  const fetchData = async (disasterType: string, apiKey: string, location: { lat: number; lng: number } | null, closestLocation: { lat: number; lng: number; name: string } | null) => {
    try {
      console.log("Running fetchData");
      if (!apiKey) {
        throw new Error("API key is missing");
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const suppliesPrompt = `There is a natural disaster of: ${disasterType}. List the supplies needed in as few words as possible in raw text.`;
      
      // Customize directions based on disaster type
      let directionsPrompt;
      if (disasterType.toLowerCase() === 'blizzard') {
        directionsPrompt = `IMPORTANT: Stay in place unless absolutely necessary. If you must travel during the ${disasterType}, here are some emergency guidelines in raw text: `;
      } else if (disasterType.toLowerCase() === 'power-plant-meltdown') {
        directionsPrompt = `URGENT: Follow the evacuation routes shown on the map above. If those are not accessible, here is your recommended evacuation path: . List this in as few words as possible in raw text.`;
      } else {
        directionsPrompt = location && closestLocation
          ? `The disaster was ${disasterType}. Provide directions to the nearest shelter (${closestLocation.name}) from the location (${location.lat}, ${location.lng}) in as few words. List this in as few words as possible in raw text.`
          : `The disaster was ${disasterType}. Provide directions to the nearest shelter in as few words. List this in as few words as possible in raw text.`;
      }

      const preventionPrompt = `The disaster was ${disasterType}. List ways to mitigate the adverse effects of ${disasterType} in as few words as possible. List this in as few words as possible in raw text.`;

      const suppliesResponse = await model.generateContent(suppliesPrompt);
      const directionsResponse = await model.generateContent(directionsPrompt);
      const preventionResponse = await model.generateContent(preventionPrompt);

      setSuppliesResults(await suppliesResponse.response.text());
      setDirectionsResults(await directionsResponse.response.text());
      setPreventionResults(await preventionResponse.response.text());
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please try again later.");
    }
  }

  useEffect(() => {
    setShowPrompt(true); // Show the prompt when the component mounts
  }, []);

  useEffect(() => {
    if (disasterType !== 'default' && disasterType !== '') {
      fetchData(disasterType, apiKey, userLocation, closestLocation);
    }
  }, [disasterType, key, userLocation, closestLocation]);

  //Gemini
  const handleDisasterSelect = (selectedDisaster: string) => {
    // Ensure the disaster type is set to the actual selection
    setDisasterType(selectedDisaster.toLowerCase());
    console.log(disasterType);
    setShowPrompt(false);
  };

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setUserLocation(location);
  };

  const handleClosestLocationChange = (location: { lat: number; lng: number; name: string }) => {
    setClosestLocation(location);
  };

  const renderContent = () => {
    if (!disasterType) return null;
    if (disasterType.toLowerCase() !== 'power-plant-meltdown') {
      return <GoogleMap disasterType={disasterType} onLocationChange={handleLocationChange} onClosestLocationChange={handleClosestLocationChange} />;
    } else {
      return (
        <div style={{ height: '100vh', width: '100%', objectFit: 'cover' }}>
          <img src={myImage} alt="Power Plant Evac Map"/>
        </div>
      );
    }
  };

  return (
    <Router>
      <div className="App">
        <DisasterPrompt show={showPrompt} onClose={handleDisasterSelect} />
        console.log(distasterType: {disasterType});
        <div className="map-box">
          {renderContent()}
        </div>

        <Accordion defaultActiveKey="0" className="accordion-sections">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Directions</Accordion.Header>
            <Accordion.Body>
              <div className="directions-box">{directionsResults}</div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Resources</Accordion.Header>
            <Accordion.Body>
              <div className="directions-box">{suppliesResults}</div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>Mitigation</Accordion.Header>
            <Accordion.Body>
              <div className="directions-box">{preventionResults}</div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="Reset-button">
          <button style={{backgroundColor: "skyblue",color:"black"}} onClick={() => setShowPrompt(true)}>Reset</button>
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
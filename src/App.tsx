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


function App() {
  const [key] = useState<string>(""); // Initialize with empty string instead of keyData
  const [disasterType, setDisasterType] = useState<string>(''); // for disaster type
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // for showing the disaster prompt
  
  const [suppliesResults, setSuppliesResults] = useState<string>("");
  const [directionsResults, setDirectionsResults] = useState<string>(""); 
  const [preventionResults, setPreventionResults] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [closestLocation, setClosestLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  console.log("Preparing apiKey");
  const apiKey = 'AIzaSyA_DtEZoxsaLBIfR2cwiSEBnqJw9voY7Sk'; // Provide a default value
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

      let suppliesPrompt = `There is a natural disaster of: ${disasterType}. List the supplies needed in as few words as possible in raw text.`;
      let preventionPrompt = `The disaster was ${disasterType}. List ways to mitigate the adverse effects of ${disasterType} in as few words as possible. List this in as few words as possible in raw text.`;
      
      // Customize directions based on disaster type
      let directionsPrompt;
      const needsLocationBasedDirections = ['flood', 'hurricane/tornado'].includes(disasterType.toLowerCase());

      if (needsLocationBasedDirections && location && closestLocation) {
        directionsPrompt = `You are a navigation assistant. Respond ONLY in this EXACT format with NO additional text:

Distance: [number] miles
Time: [estimated minutes] minutes
Main roads: [up to 3 main roads]
Landmarks: [2 landmarks maximum]
Safety note: [single line about ${disasterType} conditions]

Provide directions from (${location.lat}, ${location.lng}) to ${closestLocation.name}.
DO NOT provide any additional information or context beyond this format.`;
      } else if (disasterType.toLowerCase() === 'blizzard') {
        suppliesPrompt = `There is an ${disasterType} happening around me right now, please tell me supplies needed to survive,
        including but not limited to water, non-perishable food, and medications in a list of raw text.`;
        directionsPrompt = `There is a ${disasterType} happening around me right now, please tell me directions of what to do 
        in case of a ${disasterType} in raw text. please include the following list of directions:
        Stay indoors
        Wear multiple layers of loose, dry clothing.
        Drink plenty of water and eat warming foods.
        If you must go outside, dress in layers, cover exposed skin, and exercise to keep warm.
        Conserve home energy by lowering heat and closing doors and vents in unused rooms.
        Stay entertained with low-energy activities like games and reading.
        Have supplies ready, including water, non-perishable food, and medications`;
        preventionPrompt = 'There is a '+ disasterType + ' happening around me right now, please tell me ways to mitigate the adverse effects of a  '+ disasterType + ' on my house and family in raw text. Please include "Are you over a hot spot or near a plate boundary?" in the response in raw text';
      } else if (disasterType === "Earthquake") {
        suppliesPrompt = `There is an ${disasterType} happening around me right now, please tell me supplies needed to survive,
         including but not limited to water, non-perishable food, and medications in a list of raw text.`;
        directionsPrompt = `There is a ${disasterType} happening around me right now, please tell me directions of what to do 
        in case of a ${disasterType} in raw text. please include the following list of directions:
        Find any earthquake resistant buildings 
        If none are around you and you are outside
        stay away from tall buildings and buildings in general 
        If not possible to get away from buildings(you are inside:
        take cover under solid stable table of desk
        Move to a hallway/ against an inside wall
        If you are in bed, turn face down and cover your head with a pillow. 
        stay indoors and avoid doorways.
        Designate safe meeting place for family`;
        preventionPrompt = 'There is a '+ disasterType + ' happening around me right now, please tell me ways to mitigate the adverse effects of a  '+ disasterType + ' on my house and family in raw text. Please include "Are you over a hot spot or near a plate boundary?" in the response in raw text ';
      } else if (disasterType === "Flood") {
        suppliesPrompt = `There is an ${disasterType} happening around me right now, please tell me supplies needed to survive,
         including but not limited to water, non-perishable food, and medications in a list of raw text.`;
        directionsPrompt = `There is a ${disasterType} happening around me right now, please tell me directions of what to do 
        in case of a ${disasterType} in raw text. please include the following list of directions:
        Are you downland, or near a river 
        Move to higher ground, above the water basin 
        Last resort climb on the roof 
        Stay away from electrical wires and water
        Do not walk through moving water
        Do not drive through flooded areas`;
        preventionPrompt = 'There is a '+ disasterType + ' happening around me right now, please tell me ways to mitigate the adverse effects of a  '+ disasterType + ' on my house and family in raw text. Please include "Are you downland, or near a river?" in the response in raw text';
      } else if (disasterType === "Hurricane/Tornado") {
        suppliesPrompt = `There is an ${disasterType} happening around me right now, please tell me supplies needed to survive,
         including but not limited to water, non-perishable food, and medications in a list of raw text.`;
        directionsPrompt = `There is a ${disasterType} happening around me right now, please tell me directions of what to do 
        in case of a ${disasterType} in raw text. please include the following list of directions:
        Go to the basement and stay in the center of a room with no glass
        Stay away from windows or other glass 
        If you are outside or in a car, find a ditch or low lying area and lay flat
        Do not try to outrun a tornado
        `;
        preventionPrompt = 'There is a '+ disasterType + ' happening around me right now, please tell me ways to mitigate the adverse effects of a  '+ disasterType + ' on my house and family in raw text. ';
      } else if (disasterType.toLowerCase() === 'power plant meltdown') {
        suppliesPrompt = `There is an ${disasterType} happening around me right now, please tell me supplies needed to survive,
         including but not limited to water, non-perishable food, and medications in a list of raw text.`;
        directionsPrompt = `There is a ${disasterType} happening around me right now, please tell me directions of what to do 
        in case of a ${disasterType} in raw text. please include the following list of directions:
        Shelter in place 
        Turn off all appliances that bring outside air in 
        Close the fireplace 
        If outside seek shelter
        close all windows and doors
        Stay inside until authorities say it is safe
        Stay tuned to local news for updates`;
        preventionPrompt = 'There is a '+ disasterType + ' happening around me right now, please tell me ways to mitigate the adverse effects of a  '+ disasterType + ' on my house and family in raw text. Please include "Are you over a hot spot or near a plate boundary?" in the response in raw text';
      } else if (disasterType === "Wildfire") {
        suppliesPrompt = `There is an ${disasterType} happening around me right now, please tell me supplies needed to survive,
         including but not limited to water, non-perishable food, and medications in a list of raw text.`;
        directionsPrompt = `There is a ${disasterType} happening around me right now, please tell me directions of what to do 
        in case of a ${disasterType} in raw text. please include the following list of directions:
        Take authority made evac route 
        If caught in the fire, find an area clear of vegetation
        Lie low to the ground 
        Cover yourself with wet cloth
        Breathe close to the ground to reduce smoke intake 
        Reduce exposure to smoke as much as possible`;
        preventionPrompt = 'There is a '+ disasterType + ' happening around me right now, please tell me ways to mitigate the adverse effects of a  '+ disasterType + ' on my house and family in raw text. Please include "Are you over a hot spot or near a plate boundary?" in the response in raw text ';
      } else {
        directionsPrompt = `For this ${disasterType}, here are general evacuation and safety instructions: `;
      }
  
      // const preventionPrompt = `The disaster was ${disasterType}. List ways to mitigate the adverse effects of ${disasterType} in as few words as possible. List this in as few words as possible in raw text.`;

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
    if (disasterType === 'power plant meltdown') {
      return (
        <div className="map-box">
          <img 
            src={myImage} 
            alt="Power Plant Evac Map" 
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      );
    }
    return <GoogleMap disasterType={disasterType} onLocationChange={handleLocationChange} onClosestLocationChange={handleClosestLocationChange} />;
  };

  return (
      <div className="Everything">
        <DisasterPrompt show={showPrompt} onClose={handleDisasterSelect} />
        <div className="map-box">
          {renderContent()}
        </div>

        <Accordion defaultActiveKey="0">
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
      </div>
  );
}
export default App;

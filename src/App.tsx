import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Accordion } from 'react-bootstrap';
import ShelterList from './components/ShelterList';
import SafetyInfo from './components/SafetyInfo';
import GoogleMap from './components/GoogleMap';
import DisasterPrompt from './components/DisasterPrompt';
import { GoogleGenerativeAI } from "@google/generative-ai";


function App() {
  console.log("Starting App");

  const [disasterType, setDisasterType] = useState<string>("Blizzard"); // for disaster type. Default = Blizzard
  console.log("boot set to true")
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // for showing the disaster prompt
  
  const [suppliesResults, setSuppliesResults] = useState<string>("");
  const [directionsResults, setDirectionsResults] = useState<string>(""); 
  const [preventionResults, setPreventionResults] = useState<string>("");
  console.log("Preparing apiKey");
  const apiKey = 'AIzaSyAYfmTy4J6wwJT8DMj6XkU3cbi-ML56mmg'; // Provide a default value
  console.log("apiKey set to: " + apiKey);

  //Gemini API get and response function
  const fetchData = async (disasterType: string, apiKey: string) => {
    console.log("Running fetchData");

    //Incase the API key is gone.
    if (!apiKey) {
      console.error("API key is missing");
      return;
    }

    //
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let suppliesPrompt = `say squash`;
    let directionsPrompt = `say apple`;
    let preventionPrompt = 'say orange';
    console.log(" skethy Disaster type: " + disasterType);
    
    if (disasterType === "Blizzard") {
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
    }

    else if (disasterType === "Earthquake") {
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
    }

    else if (disasterType === "Flood") {
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
    }

    else if (disasterType === "Hurricane/Tornado") {
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
    }
    
    else if (disasterType === "Power Plant Meltdown") {
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
    }

    else if (disasterType === "Wildfire") {
      suppliesPrompt = `There is an ${disasterType} happening around me right now, please tell me supplies needed to survive,
       including but not limited to water, non-perishable food, and medications in a list of raw text.`;
      directionsPrompt = `There is a ${disasterType} happening around me right now, please tell me directions of what to do 
      in case of a ${disasterType} in raw text. please include the following list of directions:
      Take authority made evac route 
      If caught in the fire, find an area clear of vegetation
      Lie low to the ground 
      Cover yourself with wet cloth
      Breathe close to the ground to reduce smoke intake 
      Reduce exposure to smoke as much as possible

      `;
      preventionPrompt = 'There is a '+ disasterType + ' happening around me right now, please tell me ways to mitigate the adverse effects of a  '+ disasterType + ' on my house and family in raw text. Please include "Are you over a hot spot or near a plate boundary?" in the response in raw text ';
    }


    //Stores the output of the AI in {item}Response
    //Gemini.generateContent("Input String")
    const suppliesResponse = await model.generateContent(suppliesPrompt);
    const directionsResponse = await model.generateContent(directionsPrompt);
    const preventionResponse = await model.generateContent(preventionPrompt);

    //Set the response to the state
    setSuppliesResults(suppliesResponse.response.text());
    setDirectionsResults(directionsResponse.response.text());
    setPreventionResults(preventionResponse.response.text());
    console.log("Printing out gemini output");
    console.log(suppliesResponse.response.text());
    console.log(directionsResponse.response.text());
    console.log(preventionResponse.response.text());

    setSuppliesResults(suppliesResponse.response.text());
    setDirectionsResults(directionsResponse.response.text());
    setPreventionResults(preventionResponse.response.text());

  };

  //Gemini
  const handleDisasterSelect = (selectedDisaster: string) => {
    console.log("Running DisasterSelect");
    setDisasterType(selectedDisaster);
    console.log("setShowPrompt to false");
    setShowPrompt(false);
    fetchData(selectedDisaster, apiKey); // Call the API when a disaster is selected
  };

  console.log({disasterType});

  return (
      <div className="Everything">
        <DisasterPrompt show={showPrompt} onClose={handleDisasterSelect} />

        <div className="map-box">
          {disasterType && /*disasterType !== 'Hurricane/Tornado' && disasterType !== 'Blizzard' &&*/ disasterType !== 'Power Plant Meltdown' && (
            <GoogleMap disasterType={disasterType} />
          )}

          
        </div>

        <Accordion defaultActiveKey="0" className="accordion-sections">
          <Accordion.Item eventKey="0">
            <Accordion.Header className="accordion-header"><h2>Directions</h2></Accordion.Header>
            <Accordion.Body className="accordion-body">
              <div className="directions-box">{directionsResults}</div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header><h2>Resources/Supplies</h2></Accordion.Header>
            
            <Accordion.Body className="accordion-body">
            <div className="Resources-box">{suppliesResults}</div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header><h2>Mitigation</h2></Accordion.Header>
            
            <Accordion.Body className="accordion-body">
            <div className="Mitigation-box">{preventionResults}</div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="Reset-button">
          <button style={{backgroundColor: "skyblue",color:"black"}}onClick={() => {
            console.log("Reset Button Called");
            setShowPrompt(true);
            }}>Reset</button>
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
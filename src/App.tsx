import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Accordion } from 'react-bootstrap';
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

function App() {
  const [key, setKey] = useState<string>(keyData); //for api key input
  const [disasterType, setDisasterType] = useState<string>(''); // for disaster type
  const [showPrompt, setShowPrompt] = useState<boolean>(true); // for showing the disaster prompt
  const [suppliesResults, setSuppliesResults] = useState<string>("");
  const [directionsResults, setDirectionsResults] = useState<string>(""); 
  const [preventionResults, setPreventionResults] = useState<string>("");
  console.log("Preparing apiKey");
  const apiKey = process.env.REACT_APP_API_KEY || ''; // Provide a default value
  console.log("apiKey set to: " + apiKey);
  const [selectedTab, setSelectedTab] = useState(1);

  //Gemini API get and response
  const fetchData = async (disasterType: string, apiKey: string) => {
    console.log("Running fetchData");
    if (!apiKey) {
      console.error("API key is missing");
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let suppliesPrompt = `say pineapple`;
    let directionsPrompt = `say apple`;
    let preventionPrompt = 'say orange';
    console.log(" skethy Disaster type: " + disasterType);
    /*if (disasterType === "Blizzard") {
      console.log("Blizzard detected");
      suppliesPrompt = `There is a Blizzard happening around me right now, please tell me supplies needed to survive,
       including water, non-perishable food, and medications and other items needed for survival.`;
      directionsPrompt = `There is a Blizzard happening around me right now, please tell me directions of what to do 
      in case of a Blizzard. please include the following list of directions:
      Stay indoors
      Wear multiple layers of loose, dry clothing.
      Drink plenty of water and eat warming foods.
      If you must go outside, dress in layers, cover exposed skin, and exercise to keep warm.
      Conserve home energy by lowering heat and closing doors and vents in unused rooms.
      Stay entertained with low-energy activities like games and reading.
      Have supplies ready, including water, non-perishable food, and medications
`;
      preventionPrompt = 'There is a Blizzard happening around me right now, please tell me ways to mitigate the adverse effects of a Blizzard.';
    }
*/

    const suppliesResponse = await model.generateContent(suppliesPrompt);
    const directionsResponse = await model.generateContent(directionsPrompt);
    const preventionResponse = await model.generateContent(preventionPrompt);

    console.log("Printing out gemini output");
    console.log(suppliesResponse.response.text());

    setSuppliesResults(suppliesResponse.response.text());
    setDirectionsResults(directionsResponse.response.text());
    setPreventionResults(preventionResponse.response.text());
  };

  useEffect(() => {
    setShowPrompt(true); // Show the prompt when the component mounts
  }, []);

    // useEffect(() => {
    //   if (disasterType !== 'default') {
    //     fetchData(disasterType, apiKey);
    //   }
    // }, [disasterType, key]);

  //Gemini
  const handleDisasterSelect = (selectedDisaster: string) => {
    setDisasterType(selectedDisaster);
    setShowPrompt(true);
    fetchData(selectedDisaster, apiKey); // Call the API when a disaster is selected
  };
  console.log({disasterType});

  const renderDirectionsBoxContent = () => {
    switch (selectedTab) {
      case 1:
        return suppliesResults;
      case 2:
        return directionsResults;
      case 3:
        return preventionResults;
      default:
        return '';
    }
  };
  console.log({disasterType});

  return (
    <Router>
      <div className="App">
        <DisasterPrompt show={showPrompt} onClose={handleDisasterSelect} />
        console.log({disasterType});

        <div className="map-box">
          {disasterType && disasterType !== 'Earthquake' && disasterType !== 'Wildfire' && disasterType !== 'Hurricane' && disasterType !== 'Blizzard' && disasterType !== 'Power Plant Meltdown' && (
            <GoogleMap disasterType={disasterType} />
          )}
          {disasterType && (disasterType === 'Earthquake' || disasterType === 'Tsunami') && (
            <iframe
              src="path/to/your/pdf_or_image.pdf"
              style={{ width: '100%', height: '100vh' }}
              title="Disaster Information"
            />
          )}
        </div>

        <Accordion defaultActiveKey="0" className="accordion-sections">
          <Accordion.Item eventKey="0">
            <Accordion.Header><h2>Directions</h2></Accordion.Header>
            <Accordion.Body>
              <div className="directions-box">{directionsResults}</div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header><h2>Resources/Supplies</h2></Accordion.Header>
            
            <Accordion.Body>
            <div className="Resources-box">{suppliesResults}</div>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header><h2>Mitigation</h2></Accordion.Header>
            
            <Accordion.Body>
            <div className="Mitigation-box">{preventionResults}</div>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="Reset-button">
          <button style={{backgroundColor: "skyblue",color:"black"}}onClick={() => setShowPrompt(true)}>Reset</button>
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
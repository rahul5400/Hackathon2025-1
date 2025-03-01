import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import myImage from './salem-evac.jpg';
import './DisasterPrompt.css'; // Import the CSS file

interface DisasterPromptProps {
  show: boolean;
  onClose: (disasterType: string) => void;
}

const DisasterPrompt: React.FC<DisasterPromptProps> = ({ show, onClose }) => {
  const [selectedDisaster, setSelectedDisaster] = useState<string>('default');

  const handleSubmit = () => {
    onClose(selectedDisaster);
  };

  if (selectedDisaster === 'Power Plant Meltdown') {
    return (
      <div style={{ height: '100vh', width: '100%' }}>
        <img src={myImage} alt="Power Plant Evac Map"/>
      </div>
    );
  }

  return (
    <Modal show={show} onHide={() => onClose('default')}>
      <Modal.Header closeButton>
        <Modal.Title>Select Disaster Type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="disasterType">
            <Form.Label>Disaster Type:</Form.Label>
            <Form.Control as="select" value={selectedDisaster} onChange={(e) => setSelectedDisaster(e.target.value)}>
              <option value="Blizzard">Blizzard</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Flood">Flood</option>
              <option value="Hurricane/Tornado">Hurricane/Tornado</option>
              <option value="Power Plant Meltdown">Power Plant Meltdown</option>
              <option value="Tsunami">Tsunami</option>
              <option value="Wildfire">Wildfire</option>
            </Form.Control>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onClose('default')}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DisasterPrompt;

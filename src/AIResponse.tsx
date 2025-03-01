import { Button } from "react-bootstrap";
import React, { useState } from "react";

let question = "What is the disaster?";

export function Resources(): JSX.Element {
    return (
        <div>
            <h1>{question}</h1>
            <Button variant="primary">Respond</Button>
        </div>
    );
}

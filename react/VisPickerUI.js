import React from 'react';
import * as d3 from 'd3';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';


function VisPickerUI(props) {
    function handle(e) {
        console.log(e)
    }


    return (
        <React.Fragment>
            <DropdownButton id="dropdown-basic-button" title="Visualization" onSelect={props.visFns}>
                <Dropdown.Item eventKey={0}>Bubble Map</Dropdown.Item>
                <Dropdown.Item eventKey={1}>Treemap</Dropdown.Item>
                <Dropdown.Item eventKey={2}>Bubble and Treemap</Dropdown.Item>
            </DropdownButton>
        </React.Fragment>
    );
}



export default VisPickerUI;

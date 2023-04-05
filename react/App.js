import './App.css';
import React from 'react';
import VisDisplayUI from './VisDisplayUI';
function App() {
  // this will need to be passed in maybe using another component that creates the navigation tools outside the visualizations
  // const [month, setMonth] = React.useState(5);

  // add an object in each node called "isSelected" 
  

  return (
    
    <div className="App">
    <VisDisplayUI/>
  </div>
  );
}

export default App;

import React from 'react';

// Important Notes:
// 1) In the given rotations.csv file, I saw that Afternoon was set from 12:00PM to 3:00PM and Prime was set from 4:00PM to 8:00PM.
// I assumed that was a mistake and changed Afternoon to 12:00PM to 4:00PM.

// 2) Users will copy and paste rotations.csv and spots.csv into the respective textarea.
// Within the csv files, I assumed there would be no spaces within the times. 
// For example, all the times would be entered as '6:00AM', NOT '6:00 AM'.
// When copying and pasting the given csv files as is into the textareas, React wouldn't properly add spaces for each item from each row.
// Therefore, in the data.csv file, I have the rotations and spots formatted correctly, identical to what is given in the csv files, 
// with the only difference of removing spaces within the times as stated above.
// Users can copy and paste the rotations and spots from the data.csv file use this React application.
// Rotations and spots must be in the format as is in the data.csv file for the React application to work properly.

// 3) I assumed to show both the CPV by creative and CPV by rotation by day at the same time once the user submitted their data.
// For CPV by creative, I am only showing all the cpv's by Creative (TEST001H, TEST002H).
// For CPV by rotation by day, I am only showing all the cpv's by Name (Morning, Afternoon, Prime).

// 4) I assumed to round the cpv's to the nearest hundredth.   

// 5) After submitting data, if user wants to enter new data to see new cpv's, user must click on the CLEAR ALL button.

export default class CostPerView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rotations: '',
      spots: '',
      rotationsArray: [],
      spotsArray: []
    }
  }

  componentDidMount() {
    this.input.focus();
  }

  rotationsInput(e) {
    this.setState({rotations: e.target.value});
  }

  spotsInput(e) {
    this.setState({spots: e.target.value});
  }

  parseData(e) {
    e.preventDefault();
    // What the user inputs in the textarea is split into an array, using a line break as a separator
    const rotations_array = this.state.rotations.split('\n');
    const spots_array = this.state.spots.split('\n');
    
    const rotationNames = [];
    const spotNames = [];
    const rotationsOutput = [];
    const spotsOutput = [];

    // rotations.csv
    // Looping through each item in the array, each item is split into another array, using a space as a separator
    rotations_array.forEach((rotation, index) => {
      let rotationCells = rotation.split(' ');
      // assume first line is just names
      if (index === 0) {
        rotationCells.forEach(cell => {
          rotationNames.push(cell);
        });
      } 

      // Looping through each item in the rotationCells array, data from the rotationCells array is being added to the rotationsObject
      const rotationsObject = {};
      rotationCells.forEach((cell, cellIndex) => {
        let columnName = rotationNames[cellIndex];
        rotationsObject[columnName] = cell;  
      });
      rotationsOutput.push(rotationsObject);   
    });
    // rotationsOutput is now an array of objects, with the first item removed
    rotationsOutput.shift();
    // Adding the rotationsOutput array to state at the component level
    this.setState(({rotationsArray: this.state.rotationsArray.concat(rotationsOutput)}));
   
    // spots.csv
    // Same as rotations from above
    spots_array.forEach((spot, index) => {
      let spotCells = spot.split(' ');
       // assume first line is just names
      if (index === 0) {
        spotCells.forEach(cell => {
          spotNames.push(cell);
        });
      }

      const spotsObject = {};
      spotCells.forEach((cell, cellIndex) => {
        let columnName = spotNames[cellIndex];
        spotsObject[columnName] = cell;
      });
      spotsOutput.push(spotsObject);
    });
    spotsOutput.shift();
    this.setState(({spotsArray: this.state.spotsArray.concat(spotsOutput)}));

    // Clears rotations and spots from state and textarea in the DOM
    this.setState({rotations: ''});
    this.setState({spots: ''});
  }

  renderByCreative() {
    const finalResults = {};
    
    // Mapping through the spots array to create a new array with just the Creatives
    let names = this.state.spotsArray.map(spot => {
      return spot.Creative;
    });

    // Using filter to create a new array with no duplicates of the same Creatives
    let filteredNames = names.filter((name, index) => {
      return names.indexOf(name) >= index;
    });
    
    // Each Creative is a key within the finalResults object, with an empty array as its value
    filteredNames.forEach(name => {
      finalResults[name] = [];
    });

    // Looping through both the spotsArray and filteredNames, calculating cpv, and pushing cpvs into respective arrays based on Creative
    for (let i = 0; i < this.state.spotsArray.length; i++) {
      for (let j = 0; j < filteredNames.length; j++) {
        let price = Math.round((this.state.spotsArray[i].Spend / this.state.spotsArray[i].Views) * 100) / 100;

        if (this.state.spotsArray[i].Creative === filteredNames[j]) {
          finalResults[this.state.spotsArray[i].Creative].push('$' + (price.toString().length < 4 ? price.toString() + '0' : price) + ' ');
        }
      }
    }

    let result = '';
    let objectKeys = Object.keys(finalResults);
    result = objectKeys.map((objectKey, index) => (
      <li key={index}>
        <h4>{objectKey}</h4>
        <p>{finalResults[objectKey]}</p>
      </li>
    ));
 
    if (result.length > 0) {
      return (
        <div className="results-by-creative">
          <h3>CPV by creative</h3>
          <ul>
            {result}
          </ul>
        </div>
      );
    }
  }

  renderByRotation() {
    const rotations = this.state.rotationsArray;
    const spots = this.state.spotsArray;
    
    // looping through the rotations array to convert all times to 01/01/2019 06:00:00 format
    for (let i = 0; i < rotations.length; i++) {
      // converting all the Start times
      if (rotations[i].Start.slice(-2) === 'PM') {
        if (rotations[i].Start.length < 7) {
          rotations[i].Start = (parseInt(rotations[i].Start.slice(0, 1)) + 12).toString() + ':' + rotations[i].Start.slice(2, 4) + ':00';
        } else {
          rotations[i].Start = (parseInt(rotations[i].Start.slice(0, 2))).toString() + ':' + rotations[i].Start.slice(3, 5) + ':00';
        }
      } else {
        if (rotations[i].Start.length < 7) {
          rotations[i].Start = (parseInt(rotations[i].Start.slice(0, 1))).toString() + ':' + rotations[i].Start.slice(2, 4) + ':00';
        } else {
          rotations[i].Start = (parseInt(rotations[i].Start.slice(0, 2))).toString() + ':' + rotations[i].Start.slice(3, 5) + ':00';
        }
      }
        
      // converting all the End times
      if (rotations[i].End.slice(-2) === 'PM') {
        if (rotations[i].End.length < 7) {
          rotations[i].End = (parseInt(rotations[i].End.slice(0, 1)) + 12).toString() + ':' + rotations[i].End.slice(2, 4) + ':00';
        } else {
          rotations[i].End = (parseInt(rotations[i].End.slice(0, 2))).toString() + ':' + rotations[i].End.slice(3, 5) + ':00';
        }
      } else {
        if (rotations[i].End.length < 7) {
          rotations[i].End = (parseInt(rotations[i].End.slice(0, 1))).toString() + ':' + rotations[i].End.slice(2, 4) + ':00';
        } else {
          rotations[i].End = (parseInt(rotations[i].End.slice(0, 2))).toString() + ':' + rotations[i].End.slice(3, 5) + ':00';
        }
      }
    }
    
    // looping through the spots array to convert all times to 01/01/2019 06:00:00 format
    for (let i = 0; i < spots.length; i++) {
      if (spots[i].Time.slice(-2) === 'PM') {
        if (spots[i].Time.length < 7) {
          spots[i].Time = (parseInt(spots[i].Time.slice(0, 1)) + 12).toString() + ':' + spots[i].Time.slice(2, 4) + ':00';
        } else {
          spots[i].Time = (parseInt(spots[i].Time.slice(0, 2))).toString() + ':' + spots[i].Time.slice(3, 5) + ':00';
        }
      } else {
        if (spots[i].Time.length < 7) {
          spots[i].Time = (parseInt(spots[i].Time.slice(0, 1))).toString() + ':' + spots[i].Time.slice(2, 4) + ':00';
        } else {
          spots[i].Time = (parseInt(spots[i].Time.slice(0, 2))).toString() + ':' + spots[i].Time.slice(3, 5) + ':00';
        }
      }
    }
    
    // passing all times within rotations and spots through new Date() with '01/01/2019'
    // this is to enable the ability to compare times, such as being able to determine that 12:00PM is before 3:00PM but is after 6:00AM
    for (let i = 0; i < rotations.length; i++) {
      rotations[i].Start = new Date('01/01/2019 ' + rotations[i].Start);
      rotations[i].End = new Date('01/01/2019 ' + rotations[i].End);
    }  
    for (let i = 0; i < spots.length; i++) {
      spots[i].Time = new Date('01/01/2019 ' + spots[i].Time);
    }
        
    const final = {
      Morning: [],
      Afternoon: [],
      Prime: []
    };
    const finalKeys = Object.keys(final);

    // looping through both rotations & spots array to organize data within final object based on Name (Morning, Afternoon, or Prime)
    for (let i = 0; i < rotations.length; i++) {
      for (let j = 0; j < spots.length; j++) {
        let price = Math.round((spots[j].Spend / spots[j].Views) * 100) / 100;
        
        if (
          spots[j].Time < rotations[i].End && 
          spots[j].Time > rotations[i].Start && 
          finalKeys[i] === rotations[i].Name
          ) {
          final[finalKeys[i]].push('$' + (price.toString().length < 4 ? price.toString() + '0' : price) + ' ');
        }
      }
    }
 
    let finalResult = '';
    finalResult = finalKeys.map((title, index) => (
      <li key={index}>
        <h4>{title}</h4>
        <p>{final[title]}</p>
      </li>
    ));

    if (final.Morning.length > 0 || final.Afternoon.length > 0 || final.Prime.length > 0) {
      return (
        <div className="results-by-rotation">
          <h3>CPV by rotation by day</h3>
          <ul>
            {finalResult}
          </ul>
        </div>
      );   
    }
  } 
  
  resetButton() {
    if (this.state.rotationsArray.length > 0 && this.state.spotsArray.length > 0) {
      return (
        <button 
            type="submit"
            className="clear-btn" 
            onClick={() => {
              this.setState({rotationsArray: []});
              this.setState({spotsArray: []});
            }}
            >
            CLEAR ALL
        </button>
      );
    }
  }

  render() {
    return (
      <div className="cost-per-view-page">
        <h3>Show CPV by Creative & Rotation By Day</h3>

        <form onSubmit={e => this.parseData(e)}>
          <textarea 
            type="textarea" 
            className="rotations"
            placeholder="Enter your rotations"
            onChange={e => this.rotationsInput(e)}
            value={this.state.rotations}
            ref={input => this.input = input}
            required
          >
          </textarea>

          <textarea 
            type="textarea" 
            className="spots"
            placeholder="Enter your spots"
            onChange={e => this.spotsInput(e)}
            value={this.state.spots}
            required
          >
          </textarea><br/>
          <button type="submit" className="submit-btn">SUBMIT</button>
        </form>

        {this.renderByCreative()}
        {this.renderByRotation()}
        {this.resetButton()}
      </div>
    );
  }
}
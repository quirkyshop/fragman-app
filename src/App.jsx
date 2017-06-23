import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import WareHouse from './components/WareHouse/WareHouse.jsx';
import FavView from './components/FavView/FavView.jsx';

class App extends React.Component {

  render() {
    return (
      <Router>
        <div id="eku-root">
          <Route exact path="/" component={WareHouse}/>
          <Route path="/wareHouse" component={WareHouse}/>
          <Route path="/favView" component={FavView}/>
        </div>
      </Router>
    )
  }
}

export default App;

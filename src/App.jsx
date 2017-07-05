import React from 'react';
import { Router, Route, hashHistory } from 'react-router'
import WareHouse from './components/WareHouse/WareHouse.jsx';
import FavView from './components/FavView/FavView.jsx';

class App extends React.Component {

  render() {
    return (
      <div id="eku-root">
        <Router history={hashHistory}>        
            <Route path="/" component={WareHouse}/>
            <Route path="/wareHouse" component={WareHouse}/>
            <Route path="/favView" component={FavView}/>        
        </Router>
      </div>
    )
  }
}

export default App;

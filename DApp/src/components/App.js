/* this script is building the marketplace Frontend and enables the interaction with the Smart Contract 
 */
/* import { BrowserRouter } from 'react-router-dom'
import { Redirect } from 'react-router-dom' */
import {
  HashRouter as BrowserRouter,
  Redirect,
  Switch,
  Route
} from "react-router-dom";
import Marketplace from './marketplace'; 
import Impressum from './impressum';  
require('./App.css');
var React = require('react');
var Component = React.Component;

class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <Switch>
            <Redirect exact from="/" to="/marketplace" />
            <Route path="/marketplace">
              <Marketplace />
            </Route>
            <Route path="/impressum">
              <Impressum />
            </Route>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;

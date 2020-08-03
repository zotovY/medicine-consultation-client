import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";
import "./static/index.css";
// import SandBox from "./sandbox/sandbox";
require('dotenv').config()


const MainPage = lazy(() => import("./modules/main"));
const Signup = lazy(() => import("./modules/auth").then(module => ({ default: module.Signup })));
const Login = lazy(() => import("./modules/auth").then(module => ({ default: module.Login })));
const DoctorSignUp = lazy(() => import("./modules/auth").then(module => ({ default: module.DoctorSignUp })));

const Admin = lazy(() => import("./modules/admin"));
const AdminLogin = lazy(() => import("./modules/admin").then(module => ({ default: module.Login })));


const App = () => {
  return (
    <Switch>

      {/* <Route to='/sandbox'><SandBox /></Route> */}

      <Route path="/login" exact>
        <Suspense fallback={<React.Fragment />}>
          <Login />
        </Suspense>
      </Route>
      <Route path="/signup" exact>
        <Suspense fallback={<React.Fragment />}>
          <Signup />
        </Suspense>
      </Route>
      <Route path="/doctor-signup" exact>
        <Suspense fallback={<React.Fragment />}>
          <DoctorSignUp />
        </Suspense>
      </Route>
      <Route path="/" exact>
        <Suspense fallback={<React.Fragment />}>
          <MainPage />
        </Suspense>
      </Route>

      <Route path="/admin-login" exact>
        <Suspense fallback={<React.Fragment />}>
          <AdminLogin />
        </Suspense>
      </Route>;

      <Suspense fallback={<React.Fragment />}>
        <Admin />
      </Suspense>



    </Switch >
  );
}

export default App;

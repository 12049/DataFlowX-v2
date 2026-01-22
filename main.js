import express from "express";
import { routeLoader } from "./src/lib/routesLoader.js";
import { apiDocs } from "./src/lib/apiDocs.js";
import { trafficControl } from "./src/lib/globalApiProtection.js";
import panel from "./src/lib/add-api.js";
import realtime from "./src/lib/realtime.js";
import users from "./src/lib/users.js";
import authRegister from "./src/Auth/Register.js";
import authLogin from "./src/Auth/Login.js";
import getUser from "./src/Auth/getUser.js";


//import authReset from "./src/Auth/restart.js";

async function setupApp(app, options = {}) {

  await routeLoader.loadRoutes(app, "api", "/api/v1");
  app.use("/api/v1", trafficControl);
  app.get("/api/v1/:section?", apiDocs("/api/v1"));
//__________________________
app.use("/api/v2/admin/realtime", panel);
  app.use("/api/v2/admin/users", users);
app.use("/get-user", getUser);
//---------------------
app.use("/api/v2/auth/add-api", panel);
//_____________
app.use("/api/v2/auth/register", authRegister);
  app.use("/api/v2/auth/login", authLogin);
  //app.use("/api/v2/auth/reset", authReset);
}
export default setupApp;

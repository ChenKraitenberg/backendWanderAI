import appInit from "./server";
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000; // המר למספר עם ערך ברירת מחדל
import https from "https"
import fs from "fs"

const tmpFunc = async () => {
  const app = await appInit();
  if(process.env.NODE_ENV != "production"){
    app.listen(port, () => {
        console.log(`Example app listening at http://${process.env.DOMAIN_BASE || 'https://node113.cs.colman.ac.il'}:${port}`);
      });
  }else{
    const prop={
      key: fs.readFileSync("../client-key.pem"),
      cert: fs.readFileSync("../client-cert.pem")
    }
    https.createServer(prop,app).listen(port)
  }
  
};

tmpFunc();
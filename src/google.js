const fs = require("fs");
const postNotion = require("./notion");

// call this method every 24h
async function controller(
  CANVAS_API_TOKEN,
  CANVAS_ID,
  SESSION,
  NOTION_KEY,
  NOTION_DATABASE_ID
) {
  try {
    var dataMap = new Map(Object.entries(JSON.parse(fs.readFileSync("./data.json"))));
  } catch {
    // if credentialsMap is empty, nothing to parse
    return;
  }

  for (const [key, value] of Object.entries(dataMap)) {
    const freshData = await postNotion(
      (NOTION_DATABASE_ID = NOTION_DATABASE_ID),
      (NOTION_KEY = NOTION_KEY),
      (CANVAS_ID = CANVAS_ID),
      (SESSION = SESSION),
      (CANVAS_API_TOKEN = CANVAS_API_TOKEN),
      (sData = value)
    );
    dataMap.set(key, freshData);
  }
  // writeback to json
  fs.writeFileSync("./data.json", JSON.stringify(Object.fromEntries(dataMap)));
}

/**
 *
 * @param {Map} formMap key is string of name of environment variable and value is string
 */
function modifyDataJSON(formMap) {
  //TODO: how to manage UIDs of credentials file
  /*
  - do it on the frontend (keep a counter on the frontend)
  */
  try {
    var credentialsMap = new Map(
      Object.entries(JSON.parse(fs.readFileSync("./credentials.json")))
    );
  } catch {
    credentialsMap = new Map();
    // if nothing in credentials map then continue;
  }
  //
  credentialsMap.set(UID, formMap);
  fs.writeFileSync(
    "./credentials.json",
    JSON.stringify(Object.fromEntries(credentialsMap))
  );
}

controller(
  process.env.CANVAS_API_TOKEN,
  process.env.CANVAS_ID,
  process.env.SESSION,
  process.env.NOTION_KEY,
  process.env.NOTION_DATABASE_ID
);

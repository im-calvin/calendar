const { Client } = require("@notionhq/client");
const fs = require("fs");
const icsToCSV = require("./ics_to_csv");

// const databaseID = process.env.NOTION_DATABASE_ID;
// const notion = new Client({
//   auth: process.env.NOTION_KEY,
// });

/**
 *
 * @param {String} uid
 * @param {String} assignmentDate
 * @param {String} assignmentTitle
 * @param {String} className
 * parameters to be input into Notion calendar
 */
async function addItem(uid, assignmentDate, assignmentTitle, className) {
  try {
    const response = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: databaseID,
      },
      properties: {
        Name: {
          title: [
            {
              type: "text",
              text: {
                content: assignmentTitle,
              },
            },
          ],
        },
        Date: {
          type: "date",
          date: {
            start: assignmentDate,
          },
        },
        Status: {
          type: "select",
          select: {
            name: "Not Started",
          },
        },
        Class: {
          type: "select",
          select: {
            name: className,
          },
        },
        uid: {
          rich_text: [
            {
              text: {
                content: uid,
              },
            },
          ],
        },
      },
    });
    console.log(response);
    console.log("Success! Entry added.");
  } catch (error) {
    console.error(error.body);
  }
}

/**
// if no data.json, it will dump to notion
// if there is a data.json, it will check if it is false and then set to true, and set the remaining to true, and dump those to notion
 * mutates data.json file by calling addItem
 * @param {String} dbID databaseID
 * @param {String} NOTION_KEY
 * @param {String} sData staleData in data.json format; if undefined then dump all to notion
 */
async function postNotion(
  NOTION_DATABASE_ID,
  NOTION_KEY,
  CANVAS_API_TOKEN,
  CANVAS_ID,
  SESSION,
  sData
) {
  // used in other function
  var databaseID = NOTION_DATABASE_ID;
  var notion = new Client({
    auth: NOTION_KEY,
  });
  var staleData = sData;
  const freshData = await icsToCSV(CANVAS_API_TOKEN, SESSION, CANVAS_ID);

  // try {
  // var staleData = new Map(Object.entries(JSON.parse(fs.readFileSync("./data.json"))));
  // } catch { }

  // dump all to notion
  if (staleData === undefined) {
    freshData.forEach(async function (val, key) {
      await addItem(key, val[0], val[1], val[3]);
      val[2] = true;
      freshData.set(key, val);
    });
    // fs.writeFileSync("./data.json", JSON.stringify(Object.fromEntries(freshData)));
    return freshData;
  }

  // else check for new
  freshData.forEach(async function (val, key) {
    if (!staleData.has(key)) {
      await addItem(key, val[0], val[1], val[3]);
    }

    // try catch incase key is not in staledata
    if (staleData.get(key)[2] == false) {
      await addItem(key, val[0], val[1], val[3]);
    }

    val[2] = true;
    freshData.set(key, val);
  });

  // fs.writeFileSync("./data.json", JSON.stringify(Object.fromEntries(freshData)));
  return freshData;
}

postNotion(
  process.env.NOTION_DATABASE_ID,
  process.env.NOTION_KEY,
  process.env.CANVAS_API_TOKEN,
  process.env.CANVAS_ID,
  process.env.SESSION,
  undefined
);

module.exports = postNotion;

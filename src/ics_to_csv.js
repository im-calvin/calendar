const getCalendar = require("./canvas");

/**
 *
 * @param {String} dtStart as the output of an ICS file
 * @returns date in ISO format
 */
function convertTime(dtStart) {
  if (dtStart.length == 8) {
    dtStart = dtStart.slice(0, 4) + "-" + dtStart.slice(4, 6) + "-" + dtStart.slice(6, 8);
    const date = new Date(dtStart);
    return date.toISOString();
  }
  dtStart =
    dtStart.slice(0, 4) +
    "-" +
    dtStart.slice(4, 6) +
    "-" +
    dtStart.slice(6, 11) +
    ":" +
    dtStart.slice(11, 13) +
    ":" +
    dtStart.slice(13);
  const date = new Date(dtStart);
  return date.toISOString();
}

/**
 * mutates the uidMap where key is the uid for the event
 * and values is [dateStart, summaryString, if file hasn't been loaded into the json file yet, name of class]
 * @param {String} icsStr long string that is the output of the ics file
 * @param {Map} uidMap map to be mutated
 */
function parseToMap(icsStr, uidMap) {
  while (icsStr.search("BEGIN:VEVENT") != -1) {
    icsStr = icsStr.substring(icsStr.search("UID:"));

    let uid = icsStr.substring(4, icsStr.search("\r"));

    icsStr = icsStr.substring(icsStr.search("DTSTART"));

    let dtStart = icsStr.substring(8, icsStr.search("\r"));

    if (dtStart.startsWith("V")) {
      dtStart = dtStart.substring(22, icsStr.search("\r"));
    }
    dtStart = convertTime(dtStart);

    icsStr = icsStr.substring(icsStr.search("SUMMARY:"));

    let summaryStr = icsStr.substring(8, icsStr.search("\\]"));

    let summary = icsStr.substring(8, icsStr.search("\\[") - 1);

    className = icsStr.substring(icsStr.search("\\[") + 1, icsStr.search("\\[") + 9);

    if (summaryStr.includes("\r\n")) {
      icsStr = icsStr.replace("\r\n ", "");
      className = icsStr.substring(icsStr.search("\\[") + 1, icsStr.search("\\[") + 9);
    }

    uidMap.set(uid, [dtStart, summary, false, className]);
  }
}

/**
 *
 * @returns {Map} in the same format as `ParseToMap`
 */
async function icsToCSV(CANVAS_API_TOKEN, SESSION, CANVAS_ID) {
  // const session = process.env.SESSION;
  const pageMap = await getCalendar(
    (CANVAS_API_TOKEN = CANVAS_API_TOKEN),
    (CANVAS_ID = CANVAS_ID),
    (SESSION = SESSION)
  );

  let uidMap = new Map();

  for (let entry of pageMap.entries()) {
    let ics = entry[1];

    const response = await fetch(ics);
    parseToMap(await response.text(), uidMap);
  }

  return uidMap;
}

module.exports = icsToCSV;

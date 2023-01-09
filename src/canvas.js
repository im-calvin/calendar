const canvasAPI = require("node-canvas-api");

// const canvasDomain = process.env.CANVAS_API_DOMAIN;

// const canvasID = process.env.CANVAS_ID;

/**
 *
 * @param {string} session is in the format '2022W1'
 * @returns a map where keys are courseCode and values are links to ics
 */
async function getCalendar(CANVAS_API_TOKEN, CANVAS_ID, SESSION) {
  // requires process.env.CANVAS_API_DOMAIN = https://ubc.instructure.com/api/v1
  let courses = await canvasAPI.getCoursesByUser(Number(CANVAS_ID));
  let courseMap = new Map();
  for (let i = 0; i < courses.length; i++) {
    if (
      !courses[i].access_restricted_by_date ||
      courses[i].access_restricted_by_date == null
    ) {
      if (courses[i].course_code.includes(SESSION)) {
        courseMap.set(courses[i].course_code, courses[i].calendar.ics);
      }
    }
  }
  return courseMap;
}

// getCalendar(process.env.CANVAS_API_TOKEN, process.env.CANVAS_ID, process.env.SESSION);

module.exports = getCalendar;

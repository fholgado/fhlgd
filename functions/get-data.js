// lambda/airtable.js
const Airtable = require("airtable");
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_API_KEY,
});
const base = Airtable.base("appZIHDZoIDR2armb");

exports.handler = function (event, context, callback) {
  const allRecords = [];
  console.log(event);
  switch (event.queryStringParameters.type) {
    case "all_projects":
      base("Table 1")
        .select({
          maxRecords: 100,
          view: "grid",
          sort: [{ field: "Date started", direction: "desc" }],
        })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function (record) {
              allRecords.push(record);
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              callback(err);
            } else {
              const body = JSON.stringify({ records: allRecords });
              const response = {
                statusCode: 200,
                body: body,
                headers: {
                  "content-type": "application/json",
                  "cache-control": "Cache-Control: max-age=300, public",
                },
              };
              callback(null, response);
            }
          }
        );
      break;
    case "all_work_logs":
      base("Table 2")
        .select({
          maxRecords: 1000,
          view: "Grid",
          sort: [{ field: "Date", direction: "desc" }],
        })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach(function (record) {
              allRecords.push(record);
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              callback(err);
            } else {
              const body = JSON.stringify({ records: allRecords });
              const response = {
                statusCode: 200,
                body: body,
                headers: {
                  "content-type": "application/json",
                  "cache-control": "Cache-Control: max-age=300, public",
                },
              };
              callback(null, response);
            }
          }
        );
      break;
  }
};

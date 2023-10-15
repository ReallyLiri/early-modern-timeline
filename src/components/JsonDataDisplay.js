import React from "react";

function JsonDataDisplay({ jsonData }) {
  return (
    <div>
      <h2>JSON Data</h2>
      <textarea
        rows="6"
        cols="50"
        value={JSON.stringify(jsonData, null, 2)}
        readOnly
      />
    </div>
  );
}

export default JsonDataDisplay;



import fetch from 'node-fetch';
import { DataFrame } from 'pandas-js';

fetch('https://api.vam.ac.uk/v2/objects/search?q=Etruria&page_size=45&response_format=csv')
  .then(response => response.text())
  .then(csvData => {
    const parsedData = DataFrame.fromCSV(csvData, { header: true });
    const object_df = new DataFrame(parsedData);

    displayData(object_df);
  })
  .catch(error => {
    console.error('An error occurred:', error);
  });

function displayData(dataFrame) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Create table header
  const headers = dataFrame.listColumns();
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Create table body
  const rows = dataFrame.toCollection();
  rows.forEach(row => {
    const tr = document.createElement('tr');
    Object.values(row).forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  // Display the table in the HTML document
  const tableContainer = document.getElementById('tableContainer');
  tableContainer.innerHTML = ''; // Clear previous content
  tableContainer.appendChild(table);
}

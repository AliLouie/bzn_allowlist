const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { dbConfig, secretKeyMiddleware } = require("./config");

const app = express();
const port = 3000;


const dbConnection = mysql.createConnection(dbConfig);


dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});


app.use(bodyParser.json());

app.use(secretKeyMiddleware);



app.post('/addData', (req, res) => {
  const { dataToInsert } = req.body;


  const checkDuplicateQuery = 'SELECT COUNT(*) AS count FROM fc_whitelist WHERE identifier = ?';
  dbConnection.query(checkDuplicateQuery, [dataToInsert.identifier], (err, results) => {
    if (err) {
      console.error('Error checking for duplicate data:', err);
      res.status(500).json({ error: 'Error checking duplicate data' });
    } else {
      const count = results[0].count;

      if (count > 0) {

        res.status(400).json({ error: 'Duplicate data' });
      } else {

        const insertQuery = 'INSERT INTO fc_whitelist (identifier, priority) VALUES (?, ?)';
        dbConnection.query(insertQuery, [dataToInsert.identifier, dataToInsert.priority], (err, results) => {
          if (err) {
            console.error('Error inserting data into the database:', err);
            res.status(500).json({ error: 'Error inserting data' });
          } else {
            console.log('Data inserted successfully');
            res.status(200).json({ message: 'Data inserted successfully' });
          }
        });
      }
    }
  });
});


app.delete('/removeData/:identifier', (req, res) => {
  const { identifier } = req.params;


  const deleteQuery = 'DELETE FROM fc_whitelist WHERE identifier = ?';
  dbConnection.query(deleteQuery, [identifier], (err, results) => {
    if (err) {
      console.error('Error deleting data from the database:', err);
      res.status(500).json({ error: 'Error deleting data' });
    } else {
      if (results.affectedRows > 0) {
        console.log('Data deleted successfully');
        res.status(200).json({ message: 'Data deleted successfully' });
      } else {
        console.log('No data found for deletion');
        res.status(404).json({ error: 'No data found for deletion' });
      }
    }
  });
});



app.use(express.json());


app.get('/get-user/:identifier', (req, res) => {
  const { identifier } = req.params;


  const selectQuery = 'SELECT * FROM users WHERE identifier = ?';
  dbConnection.query(selectQuery, [identifier], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Error querying the database' });
    } else {
      if (results.length > 0) {
        const user = results[0];
        res.status(200).json({ user });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  });
});

//---------


app.listen(port, () => {
  console.log(`FiveCord loaded, Your Port: ${port}`);
});
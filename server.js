// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'usenergy.sqlite3');

let app = express();
let port = 8000;

// Open usenergy.sqlite3 database
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));


// GET request handler for home page '/' (redirect to /year/2018)
app.get('/', (req, res) => {
    res.redirect('/year/2018');
});

// GET request handler for '/year/*'
app.get('/year/:selected_year', (req, res) => {
    console.log(req.params.selected_year);
    fs.readFile(path.join(template_dir, 'year.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        if (err) {
            res.status(404).send('404 Error not found');
        } else {
            let year_response = data.replace('{{{YEAR}}}', req.params.selected_year);

            db.all('SELECT * from Consumption WHERE year = ?', [req.params.selected_year], (err, rows) => {
                let coal_response = data.replace('{{{COAL_COUNT}}}', rows[0].coal); // rows[0] has all elements, rows[0].coal is the coal value
                let natural_gas_reponse = data.replace('{{{NATURAL_GAS_COUNT}}}', rows[0].natural_gas);
                let nuclear_response = data.replace('{{{NUCLEAR_COUNT}}}', rows[0].nuclear);
                let petroleum_reponse = data.replace('{{{PETROLEUM_COUNT}}}', rows[0].petroleum);
                let renewable_reponse = data.replace('{{{RENEWABLE_COUNT}}}', rows[0].renewable);
                res.status(200).type('html').send(response); // is this correct thing / time to send right here
            });


            //res.status(200).type('html').send(template); // <-- you may need to change this
        }
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    console.log(req.params.selected_state);
    fs.readFile(path.join(template_dir, 'state.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        res.status(200).type('html').send(template); // <-- you may need to change this
    });
});

// GET request handler for '/energy/*'
app.get('/energy/:selected_energy_source', (req, res) => {
    console.log(req.params.selected_energy_source);
    fs.readFile(path.join(template_dir, 'energy.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        res.status(200).type('html').send(template); // <-- you may need to change this
    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});

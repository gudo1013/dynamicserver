// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
let chart = require('chart.js');


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
    fs.readFile(path.join(template_dir, 'year.html'), 'utf-8', (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        if (err) {
            res.status(404).send('404 Error not found');
        } else {

            let response = template.replace(/{{{YEAR}}}/g, req.params.selected_year);
            db.all('SELECT * from Consumption WHERE year = ?', [req.params.selected_year], (err, row) => {


                if (err) {
                    res.status(404).send("Could not finish query");
                } else {
                //response = response.replace(/{{{COAL_COUNT}}}/g, row[0].coal); 
                //response = response.replace('{{{NATURAL_GAS_COUNT}}}', row[0].natural_gas);
                //response = response.replace('{{{NUCLEAR_COUNT}}}', row[0].nuclear);
                //response = response.replace('{{{PETROLEUM_COUNT}}}', row[0].petroleum);
                //response = response.replace('{{{RENEWABLE_COUNT}}}', row[0].renewable);
                db.all('SELECT state_name from States', (err, rows) => {
                    //console.log(rows[0])
                    let i;
                    let list_items= '';
                    let coal_total = 0;
                    let natural_total = 0;
                    let nuclear_total = 0;
                    let petroleum_total = 0;
                    let renewable_total = 0;
                    for (i = 0; i < rows.length; i++) {
                        coal_total = coal_total + parseInt(row[i].coal);
                        natural_total = natural_total + parseInt(row[i].natural_gas);
                        nuclear_total = nuclear_total + parseInt(row[i].nuclear);
                        petroleum_total = petroleum_total + parseInt(row[i].petroleum);
                        renewable_total = renewable_total + parseInt(row[i].renewable);
                        let total = parseInt(row[i].coal) + parseInt(row[i].natural_gas) + parseInt(row[i].nuclear) + parseInt(row[i].petroleum) + parseInt(row[i].renewable);
                        list_items += '<tr><td>' + rows[i].state_name + '</td>\n' + '<td>' + row[i].coal + '</td>\n' + '<td>' + row[i].natural_gas + '</td>\n' + '<td>' + row[i].nuclear + '</td>\n' + '<td>' + row[i].petroleum + '</td>\n' + '<td>' + row[i].renewable + '</td>\n' + '<td>' + total + '</td></tr>\n';
                    }
                    
                    response = response.replace(/{{{COAL_COUNT}}}/g, coal_total); 
                    response = response.replace(/{{{NATURAL_GAS_COUNT}}}/g, natural_total);
                    response = response.replace(/{{{NUCLEAR_COUNT}}}/g, nuclear_total);
                    response = response.replace(/{{{PETROLEUM_COUNT}}}/g, petroleum_total);
                    response = response.replace(/{{{RENEWABLE_COUNT}}}/g, renewable_total);

                    response = response.replace('{{{STATES}}}', list_items);
                    //console.log(response);
                    res.status(200).type('html').send(response); 

                });
    
                }
            });
        }
    });
});

// GET request handler for '/state/*'
app.get('/state/:selected_state', (req, res) => {
    console.log(req.params.selected_state);
    fs.readFile(path.join(template_dir, 'state.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database
        if (err) {
            res.status(404).send('404 Error not found');
        }//if
        else {


            db.all('SELECT * from Consumption WHERE state_abbreviation =?', [req.params.selected_state.toUpperCase()], (err, rows) => {
                let response = template.toString();
                //console.log(rows[0].coal);

                //let k;
                //for (k = 0; k < 100; k++) {
                //    console.log(rows[k]);
                //}

                let i;
                    let list_items= '';
                    let year = "";
                    let coal_total = 0;
                    let natural_total = 0;
                    let nuclear_total = 0;
                    let petroleum_total = 0;
                    let renewable_total = 0;
                    console.log(rows[0].year);
                    console.log(rows[0].coal);
                    for (i = 0; i < rows.length; i++) {
                        coal_total = coal_total + parseInt(rows[i].coal);
                        natural_total = natural_total + parseInt(rows[i].natural_gas);
                        nuclear_total = nuclear_total + parseInt(rows[i].nuclear);
                        petroleum_total = petroleum_total + parseInt(rows[i].petroleum);
                        renewable_total = renewable_total + parseInt(rows[i].renewable);
                        let total = parseInt(rows[i].coal) + parseInt(rows[i].natural_gas) + parseInt(rows[i].nuclear) + parseInt(rows[i].petroleum) + parseInt(rows[i].renewable);
                        list_items += '<tr><td>' +  rows[i].year + '</td>\n' + '<td>' + rows[i].coal + '</td>\n' + '<td>' + rows[i].natural_gas + '</td>\n' + '<td>' + rows[i].nuclear + '</td>\n' + '<td>' + rows[i].petroleum + '</td>\n' + '<td>' + rows[i].renewable + '</td>\n' + '<td>' + total + '</td></tr>\n';
                    }


                console.log(coal_total);
                response = response.replace(/{{{YEAR}}}/g, year);
                response = response.replace(/{{{COAL_COUNTS}}}/g, coal_total); 
                response = response.replace(/{{{NATURAL_GAS_COUNTS}}}/g, natural_total);
                response = response.replace(/{{{NUCLEAR_COUNTS}}}/g, nuclear_total);
                response = response.replace(/{{{PETROLEUM_COUNTS}}}/g, petroleum_total);
                response = response.replace(/{{{RENEWABLE_COUNTS}}}/g, renewable_total);    
                response = response.replace(/{{{STATE}}}/g, req.params.selected_state.toUpperCase());
                console.log(list_items[0]);
                response = response.replace('{{{YEARS}}}', list_items);
                res.status(200).type('html').send(response);


            });


            
        }//else

        // <-- you may need to change this
    });
});

// GET request handler for '/energy/*'
app.get('/energy/:selected_energy_source', (req, res) => {
    console.log(req.params.selected_energy_source);
    fs.readFile(path.join(template_dir, 'energy.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        let energy_source = req.params.selected_energy_source;
    

        db.all('SELECT year, state_abbreviation, ' + energy_source + ' FROM Consumption', (err, rows) => {


            let response = template.toString();
            let i;
            let list_items = '<th>Year</th>';
            //for (i = 0; i < 10; i++) {
            //    console.log(rows[i]);
            //}

            for (i = 0; i < rows.length; i++) {
                list_items += '<th>' + rows[i].state_abbreviation + '</th>';
            }

            for (i = 0; i < rows.length; i++) {

                list_items += '<tr><td>' + rows[i].year + '</td>\n' + '<td>' + rows[i][energy_source] + '</td></tr>\n';
                
            } 


            console.log(rows[0]);


            response = response.replace(/{{{YEARS}}}/g, list_items);



            res.status(200).type('html').send(response);

        });

        //res.status(200).type('html').send(template); // <-- you may need to change this
    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});




const mysql = require('mysql')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'ajax_api_db',
    password: ''
})

connection.connect((err) => {
    if (!err) {
        console.log('database connection succesful')
    } else {
        console.log('dabatase connection failed')
    }
})

module.exports = connection
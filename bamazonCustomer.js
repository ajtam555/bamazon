// NPM INSTALL ALL PACKAGES
var mysql = require('mysql');
var inquirer = require('inquirer');
var prompt = require('prompt');
var colors = require('colors');

// CREATE MYSQL CONNECTION
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: "Bamazon"
});

// CONNECT TO MYSQL
connection.connect(function (err) {
    if (err) throw err;
});

// CUSTOM FUNCTION THAT HANDLES USER INPUT AND DATA FROM BAMAZON TABLE
function showInventory() {
    connection.query('SELECT * FROM products', function (err, inventory) {
        if (err) throw err;

        // SELECT ALL PRODUCTS FROM PRODUCTS TABLE TO DISPLAY TO CUSTOMER
        console.log('Bamazon Inventory');
        for (var i = 0; i < inventory.length; i++) {
            console.log("Item ID: " + inventory[i].item_id + " | Product: " + inventory[i].product_name + " | Department: " + inventory[i].department_name + " | Price: " + inventory[i].price + " | Quantity: " + inventory[i].stock_quantity);
        }

        inquirer.prompt([
            // PROMPT USER TO INPUT ITEM_ID AND QUANTITY
            {
                type: 'input',
                message: 'What is the item ID # of the item you would like to buy?',
                name: 'id'
            }, {
                type: 'input',
                message: 'How many would you like to buy?',
                name: 'quantity'
            }
        ]).then(function(order) {
            //console.log(JSON.stringify(order, null, 2));

            // GET THE PROPERTY 'NAME' FROM CUSTOMER INPUTS
            var quantity = order.quantity;
            var itemID = order.id;

            // QUERY BY ITEM_ID
            // DISPLAY INVENTORY, QUANTITY ORDERED AND PRICE BASED ON QUANTITY
            connection.query('SELECT * FROM products WHERE item_id=' + itemID, function (err, selectedItem) {
                if (err) throw err;

                // RUN ONLY IF ORDER QUANTITY IS GREATER OR EQUAL TO THE CURRENT INVENTORY
                if (selectedItem[0].stock_quantity - quantity >= 0) {
                    console.log('Bamazon\'s Inventory has enough '.green + selectedItem[0].product_name.green + '.');
                    console.log('Quantity in Stock: '.green + selectedItem[0].stock_quantity);
                    console.log('Order Quantity: '.green + quantity);
                    console.log('You will be charged '.green + (order.quantity * selectedItem[0].price) + ' dollars. Thank you for shopping at Bamazon.'.green);
                    
                    // mysql NPM readme: connection.query('UPDATE users SET foo = ?, bar = ?, baz = ? WHERE id = ?', ['a', 'b', 'c', userId], function(err, results) {});
                    // UPDATE QUANTITY IN PRODUCTS TABLE AFTER PURCHASE IS COMPLETE
                    connection.query('UPDATE products SET stock_quantity=? WHERE item_id=?', [selectedItem[0].stock_quantity - quantity, itemID],
                        function (err, inventory) {
                            if (err) throw err;
                            // REPEAT showInventory FUNCTION FOR CUSTOMER TO CONTINUE SHOPPING
                            showInventory();
                        });
                }

                else {
                    // RUN ONLY IF CURRENT INVENTORY IS LESS THAN ORDER QUANTITY
                    console.log('Insufficient quantity.  Current inventory for '.red + selectedItem[0].product_name.red + ' is '.red + selectedItem[0].stock_quantity + ' at this moment.'.red);
                    showInventory();
                }
            });
        });
    });
}

// INITIATE
showInventory();
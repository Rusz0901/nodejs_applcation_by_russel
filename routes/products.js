var express = require('express')
var app = express()
 
// SHOW LIST OF PRODUCTS
app.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM products ORDER BY id DESC',function(err, rows, fields) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                res.render('products/list', {
                    title: 'Products List', 
                    data: ''
                })
            } else {
                // render to views/user/list.ejs template file
                res.render('products/list', {
                    title: 'Products List', 
                    data: rows
                })
            }
        })
    })
})
 
// SHOW ADD PRODUCT FORM
app.get('/add', function(req, res, next){    
    // render to views/products/add.ejs
    res.render('products/add', {
        title: 'Add New Product',
        prod_name: '',
        quantity: '',
        amount: ''        
    })
})
 
// ADD NEW PRODUCTS POST ACTION
app.post('/add', function(req, res, next){    
    req.assert('prod_name', 'Name is required').notEmpty()           //Validate name
    req.assert('quantity', 'Quantity is required').notEmpty()             //Validate age
    req.assert('amount', 'Amount is required').notEmpty()  //Validate amount
 
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var products = {
            prod_name: req.sanitize('prod_name').escape().trim(),
            quantity: req.sanitize('quantity').escape().trim(),
            amount: req.sanitize('amount').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('INSERT INTO products SET ?', products, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/product/add.ejs
                    res.render('products/add', {
                        title: 'Add New Products',
                        prod_name: products.name,
                        quantity: products.quantity,
                        amount: products.amount                    
                    })
                } else {                
                    req.flash('success', 'Data added successfully!')
                    
                    // render to views/products/add.ejs
                    res.render('products/add', {
                        title: 'Add New Products',
                        prod_name: '',
                        quantity: '',
                        amount: ''                    
                    })
                }
            })
        })
    }
    else {   //Display errors to Products
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })                
        req.flash('error', error_msg)        
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('products/add', { 
            title: 'Add New Products',
            prod_name: req.body.prod_name,
            quantity: req.body.quantity,
            amount: req.body.amount
        })
    }
})
 
// SHOW EDIT PRODUCTS FORM
app.get('/edit/(:id)', function(req, res, next){
    req.getConnection(function(error, conn) {
        conn.query('SELECT * FROM Products WHERE id = ' + req.params.id, function(err, rows, fields) {
            if(err) throw err
            
            // if Products not found
            if (rows.length <= 0) {
                req.flash('error', 'Product not found with id = ' + req.params.id)
                res.redirect('/products')
            }
            else { // if product found
                // render to views/products/edit.ejs template file
                res.render('products/edit', {
                    title: 'Edit Product', 
                    //data: rows[0],
                    id: rows[0].id,
                    prod_name: rows[0].prod_name,
                    quantity: rows[0].quantity,
                    amount: rows[0].amount                    
                })
            }            
        })
    })
})
 
// EDIT PRODUCT POST ACTION
app.put('/edit/(:id)', function(req, res, next) {
    req.assert('prod_name', 'Name is required').notEmpty()           //Validate name
    req.assert('quantity', 'Quantity is required').notEmpty()             //Validate age
    req.assert('amount', 'Amount is required').notEmpty()  //Validate amount
 
    var errors = req.validationErrors()
    
    if( !errors ) {   //No errors were found.  Passed Validation!
        
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var products = {
            prod_name: req.sanitize('prod_name').escape().trim(),
            quantity: req.sanitize('quantity').escape().trim(),
            amount: req.sanitize('amount').escape().trim()
        }
        
        req.getConnection(function(error, conn) {
            conn.query('UPDATE products SET ? WHERE id = ' + req.params.id, products, function(err, result) {
                //if(err) throw err
                if (err) {
                    req.flash('error', err)
                    
                    // render to views/products/add.ejs
                    res.render('products/edit', {
                        title: 'Edit Product',
                        id: req.params.id,
                        prod_name: req.body.prod_name,
                        quantity: req.body.quantity,
                        amount: req.body.amount
                    })
                } else {
                    req.flash('success', 'Data updated successfully!')
                    
                    // render to views/products/add.ejs
                    res.render('products/edit', {
                        title: 'Edit Products',
                        id: req.params.id,
                        prod_name: req.body.name,
                        quantity: req.body.quantity,
                        amount: req.body.amount
                    })
                }
            })
        })
    }
    else {   //Display errors to Products
        var error_msg = ''
        errors.forEach(function(error) {
            error_msg += error.msg + '<br>'
        })
        req.flash('error', error_msg)
        
        /**
         * Using req.body.name 
         * because req.param('name') is deprecated
         */ 
        res.render('products/edit', { 
            title: 'Edit Products',            
            id: req.params.id, 
            prod_name: req.body.prod_name,
            quantity: req.body.quantity,
            amount: req.body.amount
        })
    }
})
 
// DELETE PRODUCT
app.delete('/delete/(:id)', function(req, res, next) {
    var products = { id: req.params.id }
    
    req.getConnection(function(error, conn) {
        conn.query('DELETE FROM products WHERE id = ' + req.params.id, products, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)
                // redirect to products list page
                res.redirect('/products')
            } else {
                req.flash('success', 'Products deleted successfully! id = ' + req.params.id)
                // redirect to productss list page
                res.redirect('/products')
            }
        })
    })
})
 
module.exports = app
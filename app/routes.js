var mongoose = require('mongoose');
var express = require('express');

require('./models/Items');
require('./models/ToDos');

var ToDo = mongoose.model('ToDo');
var Item = mongoose.model('Item');

module.exports = function(app) {

	// get all todos
	app.get('/todos', function(req, res) {

		// use mongoose to get all todos in the database
		ToDo.find(function(err, todos) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err)

			res.json(todos); // return all todos in JSON format
		});
	});   
    
    app.get('/todos/:todo_id/items', function(req, res) {
        
        Item.find({todoId: req.params.todo_id}, function(findError, foundItems) {
                        if(findError) {
                            res.send(findError)
                        } else {
                            //console.log(foundItems);
                            res.json(foundItems);
                        }
        }); 
    });
  
	// create todo and send back all todos after creation
	app.post('/todos', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		ToDo.create({
			ToDoName : req.body.ToDoName
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			ToDo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});

	});
    
    app.post('/todos/:todo_id/items', function(req, res, next) {
        Item.create({
            ItemName : req.body.ItemName,
            todoId : req.params.todo_id
        }, function(err, item) {
            if (err)
                res.send(err);
            else {
                //push to proper ToDo
                ToDo.update({_id: req.params.todo_id}, {$push: { items: item }}, function(updateError, updateResponse){
                    if(updateError) {
                        res.send(updateError);
                    } else {
                        //find all items that have exact todo_id
                        Item.find({todo: req.params.todo_id}, function(findError, foundItems) {
                            if(findError) {
                                res.send(findError)
                            } else {
                                res.json(foundItems);
                            }
                        });
                      }
                });   
             }
          });     
        });
    
	// delete a todo
	app.delete('/todos/:todo_id', function(req, res) {
		ToDo.remove({
			_id : req.params.todo_id
		}, function(err, todo) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			ToDo.find(function(err, todos) {
				if (err)
					res.send(err)
				res.json(todos);
			});
		});
	});
    
    // delete a item
	app.delete('/todos/:todo_id/items', function(req, res) {
		Item.remove({
			_id : req.params.todo_id
		}, function(err, item) {
			if (err)
				res.send(err);

			// get and return all the todos after you create another
			Item.find(function(err, items) {
				if (err)
					res.send(err)
				res.json(items);
			});
		});
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};

var mongoose = require('mongoose');

var ToDo = new mongoose.Schema({
    ToDoName : String,
    items: [ {item : { type: mongoose.Schema.Types.ObjectId, ref: 'Item'}}]
});

mongoose.model('ToDo', ToDo);
var mongoose = require('mongoose');

var Item = new mongoose.Schema({
    ItemName : String,
    todoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Todo'}
});

mongoose.model('Item', Item);
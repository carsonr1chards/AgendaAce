const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://carson211richards:cRB8LfOLEpltc3mL@cluster0.cqaq5jj.mongodb.net/?retryWrites=true&w=majority')

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Task name is required"]
    },
    time: {
        type: Number,
        required: [true, "Task time is required"]
    },
    date: {
        type: Number,
        required: [true, "Task date is required"]
    },
    notes: {
        type: String,
        maxlength: [100, "Notes must be less than 100 characters."]
    },
    tag: String
})

const Task = mongoose.model('Task', taskSchema)

module.exports = {
    Task: Task
} 
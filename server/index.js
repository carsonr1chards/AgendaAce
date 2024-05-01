const express = require('express')
const model = require('./model')
const cors = require('cors')

const app = express()
app.use(express.urlencoded({ extended: false}));
app.use(cors())
app.use(express.static("client"))
// move all of client folder contents into public folder next to server file
// in app.js remove http://localhost:8080, just leave /foods

// get all tasks
app.get("/tasks", function(request, response){
    model.Task.find().sort({date: 1, time: 1}).then((tasks) => {
        response.set("Access-Control-Allow-Origin", "*")
        response.json(tasks);
    })
});

app.get("/tasks/:tag", function(request, response){
    model.Task.find({ tag:request.params.tag }).sort({date: 1, time: 1}).then((tasks) => {
        response.set("Access-Control-Allow-Origin", "*")
        response.json(tasks);
    })
})

// create task
app.post("/tasks", function (request, response){
    console.log("request body:", request.body);

    const newTask = new model.Task({
         name: request.body.name,
         time: request.body.time,
         date: request.body.date,
         notes: request.body.notes,
         tag: request.body.tag
    })
    newTask.save().then(() => {
        response.set("Access-Control-Allow-Origin", "*")
        response.status(201).send("Created");
    }).catch((error) => {
        if (error.errors) { // if mongoose validation failed
            var errorMessages = {};
            for (var fieldName in error.errors){
                errorMessages[fieldName] = error.errors[fieldName].message;
            }
            response.status(422).json(errorMessages);
        } else {
            response.status(500).send("Unknown error creating task.")
        }
    });
});

// delete task member
app.delete("/tasks/:taskID", function (request, response){
    console.log("Delete task with id: ", request.params.taskID)
    model.Task.findOne({ _id: request.params.taskID }).then((task) => {
        if (task){
            model.Task.deleteOne({ _id: request.params.taskID }).then(() => {
                response.set("Access-Control-Allow-Origin", "*");
                response.sendStatus(200);
            }).catch((error) => {
                console.error("Failed to delete task with ID:", request.params.taskID);
                response.sendStatus(404);
            })
        } else {
            response.sendStatus(404);
        }
    }).catch((error) => {
        console.error("Failed to query task with ID:", request.params.carID);
        response.sendStatus(404);
    })
});

app.put("/tasks/:taskID", function (request, response) {
    const updateTask = {
        $set: {
            name: request.body.name,
            time: request.body.time,
            date: request.body.date,
            notes: request.body.notes,
            tag: request.body.tag
        }
    };

    console.log("Editing task with ID:", request.params.taskID);
    console.log("New task data:", updateTask);

    model.Task.findOneAndUpdate({ _id: request.params.taskID }, updateTask, { new: true })
        .then(updatedTask => {
            if (updatedTask) {
                console.log("Task updated successfully:", updatedTask);
                response.sendStatus(200);
            } else {
                console.error("Task not found with ID:", request.params.taskID);
                response.sendStatus(404);
            }
        })
        .catch(error => {
            console.error("Failed to update task with ID:", request.params.taskID, error);
            response.sendStatus(500); // Internal Server Error
        });
});


app.listen(8080, function(){
    console.log("Server is running...");
});
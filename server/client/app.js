Vue.createApp({

    data: function (){
        return{
            newTaskName: "",
            newTaskTime: "",
            newTaskDate: "",
            newTaskNotes: "",
            newTaskTag: "",
            tasks: {},
            dates: [],
            add: true,
            addDisplay: false,
            editDisplay: false,
            tasksView: true,
            taskInfo: false,
            currentTask: [],
            editedTask: {
                name: '',
                time: '',
                date: '',
                notes: '',
                tag: ''
              },
            tagValues: ['', 'school', 'work', 'chores', 'appointment'],
            tags: {
                '': 'none',
                'school': 'School', 
                'work': "Work", 
                'chores': 'Chores', 
                'appointment': 'Appointment'
            },
            errorMessages: {}
        };
    },

    methods: {
        addTask: function () {
            if (this.validateTasks()){
                var data = "name=" + encodeURIComponent(this.newTaskName);
                data += "&time=" + encodeURIComponent(this.timeToInt(this.newTaskTime));
                data += "&date=" + encodeURIComponent(this.dateToInt(this.newTaskDate));
                data += "&notes=" + encodeURIComponent(this.newTaskNotes);
                data += "&tag=" + encodeURIComponent(this.newTaskTag);

                fetch("/tasks",{
                    method: "POST",
                    body: data,
                    headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                    }
                }).then((response) => {
                    if (response.status == 201){
                        this.newTaskTime = this.timeToInt(this.newTaskTime);
                        this.newTaskDate = this.dateToInt(this.newTaskDate);

                        if (!this.tasks[this.newTaskDate]) {
                            this.tasks[this.newTaskDate] = [];
                            this.dates.push(this.formatDate(this.newTaskDate));
                        }
                        //this.tasks[this.formatDate(this.newTaskDate)].push({'name': this.newTaskName, 'time': this.formatTime(this.newTaskTime), 'date': this.formatDate(this.newTaskDate), 'notes': this.newTaskNotes, 'tag': this.newTaskTag});
                        this.newTaskName = "";
                        this.newTaskTime = "";
                        this.newTaskDate = "";
                        this.newTaskNotes = "";
                        this.newTaskTag = "";
                        this.loadTasks();
                    }
                });
            }
        },

        deleteTask: function(){
            taskID = this.currentTask.id;
            fetch('/tasks/' + taskID, {
                method: "DELETE",
            }).then((response) => {
                console.log("Task deleted: ", taskID);
                this.loadTasks();
                if (!this.tasks[this.newTaskDate]) {
                    this.dates.pop(this.formatDate(this.newTaskDate));
                }
                this.closeTaskInfo();
            });
        },

        editTask: function(){
            taskID = this.currentTask.id;
            var data = "name=" + encodeURIComponent(this.newTaskName);
            data += "&time=" + encodeURIComponent(this.timeToInt(this.newTaskTime));
            data += "&date=" + encodeURIComponent(this.dateToInt(this.newTaskDate));
            data += "&notes=" + encodeURIComponent(this.newTaskNotes);
            data += "&tag=" + encodeURIComponent(this.newTaskTag);

            console.log("Request data:", data);

            fetch('/tasks/' + taskID, {
                method: "PUT",
                body: data,
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded"
                }
            }).then((response) => {
                console.log("Task modified: ", taskID);
                this.loadTasks();
                this.closeEdit();
            });
        },

        loadTasks: function() {
            fetch("/tasks").then((response) => {
                if (response.status == 200) {
                    response.json().then((tasksFromServer) => {
                        console.log("received tasks from API:", tasksFromServer);
                        this.tasks = {};
                        this.dates = [];
                        tasksFromServer.forEach(task => {
                            if (!this.tasks[this.formatDate(task.date)]) {
                                this.tasks[this.formatDate(task.date)] = [];
                                this.dates.push(this.formatDate(task.date));
                            }
                            task.date = this.formatDate(task.date);
                            task.time = this.formatTime(task.time);
                            this.tasks[task.date].push(task);
                        });
                    });
                }
            });
        },

        filterTasks: function(filter){
            if (filter == 'none'){
                this.loadTasks();
                return;
            }
            fetch("/tasks/" + filter).then((response) => {
                if (response.status == 200) {
                    response.json().then((tasksFromServer) => {
                        console.log("received tasks from API:", tasksFromServer);
                        this.tasks = {};
                        this.dates = [];
                        tasksFromServer.forEach(task => {
                            if (!this.tasks[this.formatDate(task.date)]) {
                                this.tasks[this.formatDate(task.date)] = [];
                                this.dates.push(this.formatDate(task.date));
                            }
                            task.date = this.formatDate(task.date);
                            task.time = this.formatTime(task.time);
                            this.tasks[task.date].push(task);
                        });
                    });
                }
            });
        },

        toggleAdd: function(){
            this.addDisplay = !this.addDisplay;
            this.add = !this.add;
            this.newTaskName = "";
            this.newTaskTime = "";
            this.newTaskDate = "";
            this.newTaskNotes = "";
            this.newTaskTag = "";
            this.errorMessages = {};
        },

        formatDate: function(date){
            // takes a date as an int and converts it to a string in mm/dd/yyyy format
            const year = Math.floor(date / 10000);
            const month = Math.floor((date % 10000) / 100);
            const day = date % 100;
            
            // Format the date with leading zeros if necessary
            const formattedMonth = String(month).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            
            return `${formattedMonth}/${formattedDay}/${year}`;
        },

        formatTime: function(time){
            pm = false
            if (time > 1159){
                if (time > 1259)
                    time -= 1200;
                pm = true;
                time = String(time);
            }
            time = String(time).padStart(4, 0);
            hour = time.slice(0,2);
            minute = time.slice(2,4);
            if (pm){
                time = hour + ':' + minute + ' PM';
            } else{
                time = hour + ':' + minute + ' AM';
            }
            return time;
        },

        openTaskInfo: function(name, time, notes, tag, date, id){
            this.tasksView = !this.tasksView;
            this.taskInfo = !this.taskInfo;
            this.currentTask = {'name': name, 'time': time, 'notes': notes, 'tag': tag, 'date': date, 'id': id}
        },

        closeTaskInfo: function(){
            this.tasksView = true;
            this.taskInfo = false;
        },

        openEdit: function(){
            this.newTaskName = this.currentTask.name;
            this.newTaskDate = this.formattedDate;
            this.newTaskTime = this.formattedTimeValue(this.currentTask.time);
            this.newTaskNotes = this.currentTask.notes;
            this.newTaskTag = this.currentTask.tag;
            this.editDisplay = true;
            this.taskInfo = false;
        },

        closeEdit: function(){
            this.editDisplay = false;
            this.taskInfo = false;
            this.tasksView = true;

            this.newTaskName = "";
            this.newTaskDate = "";
            this.newTaskTime = "";
            this.newTaskNotes = "";
            this.newTaskTag = "";
            this.errorMessages = {};
        },

        timeToInt: function(timeStr) {
            /*
            Convert a string time in the format "HH:MM" to an integer representation.
            */
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 100 + minutes;
        },
        
        dateToInt: function(dateStr) {
            /*
            Convert a string date in the format "YYYY-MM-DD" to an integer representation in YYYYMMDD format.
            */
            const [year, month, day] = dateStr.split('-').map(Number);
            return year * 10000 + month * 100 + day;
        },

        formattedTimeValue(givenTime) {
            const time = new Date(`2000-01-01 ${givenTime}`);
            const hours = time.getHours().toString().padStart(2, "0");
            const minutes = time.getMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
        },

        test: function(){
            console.log(this.currentTask.time);
        },

        validateTasks: function() {
            this.errorMessages = {};
            if (this.newTaskName == "") {
                this.errorMessages.taskName = "Please enter a task name.";
            }
            if (this.newTaskTime == "") {
                this.errorMessages.taskTime = "Please enter a task time.";
            }
            if (this.newTaskDate == "") {
                this.errorMessages.taskDate = "Please enter a task date.";
            }
            if (this.newTaskNotes.length > 100){
                this.errorMessages.taskNotes = "Notes must be < 100 characters."
            }
            return this.taskIsValid;
        },

        errorMessageForField: function(field){
            return this.errorMessages[field];
        }

    },

    created: function() {
        console.log("Hello, Vue.");
        this.loadTasks();
    },

    computed: {
        uniqueDates() {
            return [...new Set(this.dates)];
        },

        formattedDate() {
            if (!this.currentTask.date) return ''; // Handle empty date
            const parts = this.currentTask.date.split('/'); // Split date string by "/"
            if (parts.length !== 3) return ''; // Invalid date format
            // Reformat date to "YYYY-MM-DD" format
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        },

        formattedTime() {
            return this.formattedTimeValue(this.currentTask.time);
        },

        taskIsValid: function() {
            return Object.keys(this.errorMessages).length === 0;
        }
    }

}).mount("#app");
const { expect } = require('chai');
const axios = require('../utils/client');
const config = require('../conf/stage.json');

describe('Calculate percentage of users', function() {
    let fanCodeUsers;
    it('to get a todo item', async function() {
        const response = await axios.get('/todos/1');
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('userId');
        expect(response.data).to.have.property('id', 1);
        expect(response.data).to.have.property('title');
        expect(response.data).to.have.property('completed');
    });

    it('Check if a user has todo tasks', async function() {
        const response = await axios.get(`/todos`);

        expect(response.status).to.equal(200);
        expect(response.data).to.be.an('array');
        response.data.forEach(element => {
            expect(element).to.have.property('userId');  
        });
    });

    it('Check if user belongs to FanCode city', async function() {
        const response = await axios.get('/users');
        expect(response.status).to.equal(200);
        expect(response.data).to.be.an('array');

        fanCodeUsers = response.data.filter(user => {
            const lat = parseFloat(user.address.geo.lat);
            const lng = parseFloat(user.address.geo.lng);
            return lat >= -40 && lat <= 5 && lng >= 5 && lng <= 100;
        });

        expect(fanCodeUsers.length).to.be.above(0, 'No users found with lat between -40 to 5 and lng between 5 to 100');

    });

    it('User completed task percentage should be greater than 50', async function() {
        const taskPercentUsers = await Promise.all(fanCodeUsers.map(async (user) => {
            //fetch all the todos for each user ID
            const todosResponse = await axios.get(`/todos?userId=${user.id}`);
            expect(todosResponse.status).to.equal(200);
            const todos = todosResponse.data;

            const completeTasks = todos.filter(todo => todo.completed == true).length;
            const totalTasks = todos.length;
            const completePercent = totalTasks === 0 ? 0 : (completeTasks / totalTasks) * 100;

            return {
                ...user,
                taskCompletionPercentage: completePercent
            };

        }));

        const filteredUsersBasedOnPercent = taskPercentUsers.filter(user => user.taskCompletionPercentage > 50);
        expect(filteredUsersBasedOnPercent.length).to.be.above(0, 'No users found with lat between -40 to 5, lng between 5 to 100, and task completion percentage greater than 50%');
        filteredUsersBasedOnPercent.forEach(user => {
            expect(user).to.have.property('taskCompletionPercentage');
            expect(user.taskCompletionPercentage).to.be.greaterThan(50);
            console.log(`User:: ${user.name}, Percentage of task completion:: ${user.taskCompletionPercentage}%`);
        });


    });
});


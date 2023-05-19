const mongoose = require ('mongoose');
const chartData = new mongoose.Schema({
    description : {
        type : String,
        required : true,
    },
    account1 : {
        type : String,
        required : true,
    },
    account2 : {
        type : String,
        required : true,

    }
})

const createChartData = mongoose.model('chartOfAccountData',chartData);
module.exports = createChartData;
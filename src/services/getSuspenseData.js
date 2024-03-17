const mongodbClient = require("../config/mongodb");
const moment = require("moment");

const getSuspenseDataBy1D = async (cid, from, to) => {
  let currentDate = moment(from);
  const endDate = moment(to);
  const dateRange = [];
  
  while (currentDate <= endDate) {
    dateRange.push(currentDate.format("YYYY-MM-DD"));
    currentDate = currentDate.add(1, 'days');
  }
  
  const query = {
    "metadata.customer": cid,
    "amount": { $gt: 0 },
    "timestamp": { $gte: new Date(from), $lte: new Date(to) }
  };
  
  const transactions = await mongodbClient.db('core').collection('customer_balance_transaction').aggregate([
    { $match: query },
    { $group: {
        _id: {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" }
        },
        totalAmount: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]).toArray();
  
  const filledTransactions = dateRange.map(date => {
    const [year, month, day] = date.split("-");
    const found = transactions.find(item =>
        item._id.year === Number(year) && item._id.month === Number(month) && item._id.day === Number(day)
    );
    
    return {
      id: date,
      object: 'suspense',
      date: date,
      amount: found ? found.totalAmount : 0,
    };
  });
  
  return {
    object: 'list',
    has_more: false,
    data: filledTransactions,
  }
}

module.exports = {getSuspenseDataBy1D}

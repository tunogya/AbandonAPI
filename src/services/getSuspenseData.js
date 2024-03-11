const mongodbClient = require("../config/mongodb");

const getSuspenseDataBy1D = async (cid, from, to) => {
  const query = {
    "metadata.customer": cid,
    "amount": {$gt: 0},
    "timestamp": {}
  }
  
  if (from) query.timestamp.$gte = from;
  if (to) query.timestamp.$lte = to;
  
  const transactions = await mongodbClient.db().collection('customer_balance_transaction').aggregate([
    {
      $match: query
    },
    {
      $group: {
        _id: {
          year: {$year: "$timestamp"},
          month: {$month: "$timestamp"},
          day: {$dayOfMonth: "$timestamp"}
        },
        totalAmount: {$sum: "$amount"}
      }
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1
      }
    }
  ]).toArray();
  
  return {
    object: 'list',
    has_more: false,
    data: transactions.map((item) => ({
      id: item._id.year + '-' + item._id.month + '-' + item._id.day,
      object: 'suspense',
      date: item._id.year + '-' + item._id.month + '-' + item._id.day,
      amount: item.totalAmount,
    })),
  }
}

module.exports = {getSuspenseDataBy1D}
const stripe = require("../config/stripe");
const userInfoClient = require("../config/userInfoClient");
const {Redis} = require("@upstash/redis");

const redis = Redis.fromEnv();

const getCustomerByReq = async (req) => {
  const auth = req.auth;
  const sub = auth.payload.sub;
  const token = auth.token;
  let customer;
  
  const cid = await redis.get(`subToCid:${sub}`);
  if (cid) {
    customer = await stripe.customers.retrieve(cid);
  } else {
    const {data} = await userInfoClient.getUserInfo(token)
    const email = data.email;
    const customers = await stripe.customers.list({
      email: email,
    });
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          id: sub,
        },
        balance: {
          amount: 0,
          currency: 'usd',
        }
      });
    }
    await redis.set(`subToCid:${sub}`, customer.id);
  }
  
  return customer;
}

module.exports = getCustomerByReq
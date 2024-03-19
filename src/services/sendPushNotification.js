async function sendPushNotification(to, sound = 'default', title, body, data) {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: to,
        sound: sound,
        title: title,
        body: body,
        data: data,
      }),
    });
  } catch (e) {
    console.log(e);
  }
}

module.exports = { sendPushNotification }
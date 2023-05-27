// first 3 char of err.message is the status, separated by a '-'
// if the '-' is not the [3] char, it defaults to status 500

module.exports = (err, req, res, next) => {

  // this will the response sent to the client
  // stack property will be added if in development
  const json = {
    message: err.message[3] === '-' ? err.message.slice(4) : err.message
  }


  if (process.env.NODE_ENV === 'development') {
    // adds stack to json
    json.stack = err.stack

    // logs error on console for visibility while testing
    console.error(err)

    // logs message to make clear the middleware caught the error and responded properly
    console.log(`error caught my middleware: ${json.message}`)
  }


  // if the message is custom it should include the status on position 0-2 and a '-' on position 3
  // if it does not, it means it is an uncaught error, shoudl return 500
  //-consider: sending status as string is deprecated, so i use parseInt, could this cause problems? maybe i should tryParse
  res.status(err.message[3] === '-' ? parseInt(err.message.slice(0, 3)) : 500)


  // returns json object to client
  res.json(json)




  // only send discord messages if the error is a 500, this helps with debugging and allows real time error reporting
  if (res.status !== 500 || !process.env.WEBHOOK_URL)
    return


  // send separates messages to avoid discord's character limit
  fetch(process.env.WEBHOOK_URL,
    {
      "method": "POST",
      "headers": { "Content-Type": "application/json" },
      "body": JSON.stringify({
        "content": err.message
      })
    })


  fetch(process.env.WEBHOOK_URL,
    {
      "method": "POST",
      "headers": { "Content-Type": "application/json" },
      "body": JSON.stringify({
        "content": err.stack
      })
    })
}
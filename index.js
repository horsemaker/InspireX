// console.log(`Hello from Node.js ${process.version}!`);

const Discord = require('discord.js')
const fetch = require('node-fetch')
const Database = require("@replit/database")

const db = new Database()
const { Client, Intents } = Discord

const sadWords = ["sad", "depressed", "unhappy", "angry"]
const starterEncouragements = ["Cheer Up!", "Hang in there!", "You are a great person!"]

db.get("encouragements").then(encouragements => {
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", starterEncouragements)
  }
})

db.get("responding").then(value => {
  if (!value == null) {
    db.set("responding", true)
  }
})

function updateEncouragements(encouragementMessage) {
  db.get("encouragements").then(encouragements => {
    encouragements.push(encouragementMessage)
    db.set("encouragements", encouragements)
  })
}

function deleteEncouragement(index) {
  db.get("encouragements").then(encouragements => {
    if (encouragements.length > index) {
      encouragements.splice(index, 1)
      db.set("encouragements", encouragements)
    }
  })
}

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] })

function getQuote() {
  return fetch("https://zenquotes.io/api/random").then(res => res.json()).then(data => (data[0]["q"] + " - " + data[0]["a"]))
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("messageCreate", msg => {
  if (msg.author.bot) return

  if (msg.content === "$inspire") {
    getQuote().then(quote => {
      // console.log(quote)
      msg.channel.send(quote)
    })
  }

  db.get('responding').then(responding => {
    if (responding && sadWords.some(word => msg.content.includes(word))) {
      db.get("encouragements").then(encouragements => {
        const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
        msg.reply(encouragement)
      })
    }
  })

  if (msg.content.startsWith("$new")) {
    const encouragingMessage = msg.content.split("$new ")[1]
    updateEncouragements(encouragingMessage)
    msg.channel.send("New Inspiring Message added! :)")
  }

  if (msg.content.startsWith("$del")) {
    const index = parseInt(msg.content.split("$del ")[1])
    deleteEncouragement(index)
    msg.channel.send("Inspiring Message deleted! :(")
  }

  if (msg.content.startsWith("$list")) {
    db.get("encouragements").then(encouragements => {
      if (!encouragements || encouragements.length < 0) {
        msg.channel.send("No Inspiring Message! :(")
      } else  {
        let enString = encouragements.join("\n")
        msg.channel.send(enString)
      }
    })
  }

  if (msg.content.startsWith("$res")) {
    const value = msg.content.split("$res ")[1]

    if (value.toLowerCase() == "true") {
      db.set("responding", true)
      msg.channel.send("Responding is ON")
    } else {
       db.set("responding", false)
      msg.channel.send("Responding is OFF")
    }
  }
})

client.login(process.env.TOKEN)
// console.log("Ready!")
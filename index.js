import 'dotenv/config'
import linebot from 'linebot'
import dat from './data.js'
import schedule from 'node-schedule'
import mode from './mode.js'
// import testallList from './areaList.js'

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.on('message', (e) => {

})

// 取得當日資料
let allList = ''
const getAllList = async function () {
  allList = await dat.getData()
}
// 寄出加工過的簡訊
const pushMessage = function (c, t) {
  // 可成功抓單日+顯
  const place = allList[c]
  const dayinfo = place.areasInfo[t].dayWeather
  const test = mode.list([place.areasName, place.areasInfo[t].area, dayinfo])

  const daydetail = place.areasInfo[t].dayWeather[0].summary.result
  const largest = 0
  const speak = ['下雨', '易下雨', '一半機率下雨', '不易下雨', '不下雨']
  for (const i in daydetail) {
    if (daydetail[i].value[1] > largest) {
      daydetail[i].value[1] = largest
    }
  }

  const box = [{
    type: 'flex',
    altText: `今日${largest >= 80 ? speak[0] : largest >= 60 ? speak[1] : largest === '50' ? speak[2] : largest >= 30 ? speak[3] : speak[4]}`,
    contents: {
      type: 'carousel',
      contents: [test]
    }
  }]
  bot.broadcast(box)
}
bot.listen('/', process.env.PORT || 3000, async () => {
  console.log('bot on')
  await getAllList()
  // 輸入地區區碼
  const countryCode = 17
  const townCode = 5
  // const countryCode = 18
  // const townCode = 11
  // const countryCode = 0
  // const townCode = 0
  schedule.scheduleJob('59 23 * * *', getAllList)
  schedule.scheduleJob('0 6 * * *', function () {
    pushMessage(countryCode, townCode)
  })
})

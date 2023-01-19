import { StatusBar } from 'expo-status-bar'
import {StyleSheet, Text, View, TouchableOpacity, Vibration } from 'react-native'
import React from 'react'
import * as Location from "expo-location"

export default function App() {
  const [prayerTimes, setPrayerTimes] = React.useState([
    {title: 'Fajr', time: '', id: 1},
    {title: 'Dhuhr', time: '', id: 2},
    {title: 'Asr', time: '', id: 3},
    {title: 'Maghrib', time: '', id: 4},
    {title: 'Isha', time: '', id: 5}
  ])
  const [display, setDisplay] = React.useState(true)

  async function getLocation(){
    const foregroundPermission = await Location.requestForegroundPermissionsAsync()
    let userLocation = await Location.getCurrentPositionAsync({})
    const location = JSON.parse(JSON.stringify(userLocation))
    return [location.coords.longitude, location.coords.latitude]
  }

  React.useEffect(
    (()=>{
      async function start(){
        let d = new Date()
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()

        const locationAry = await getLocation()
        
        const response = await fetch(`https://api.aladhan.com/v1/calendar?latitude=${locationAry[1]}&longitude=${locationAry[0]}&method=2&month=${month}&year=${year}`)
        const data = await response.json()
        const timings = data.data[day].timings
        let timingsAry = [timings.Fajr, timings.Dhuhr, timings.Asr, timings.Maghrib, timings.Isha]

        timingsAry = timingsAry.map(time => time.split("(")[0].trim())

        timingsAry = timingsAry.map(time => {
          let ary = time.split(":")
          let hour = parseInt(ary[0])
          if(hour > 12){
            hour -= 12
            ary.push("PM")
          }
          else if(hour == 12){
            ary.push("PM")
          }
          else{
            ary.push("AM")
          }
          return hour.toString() + ":" + ary[1] + " " + ary[2]
        })

      setPrayerTimes([
        {title: 'Fajr', time: timingsAry[0], id: 1},
        {title: 'Dhuhr', time: timingsAry[1], id: 2},
        {title: 'Asr', time: timingsAry[2], id: 3},
        {title: 'Maghrib', time: timingsAry[3], id: 4},
        {title: 'Isha', time: timingsAry[4], id: 5}])
    }
    start()
    }),
    []
  )

  function displayTimes(){
    setDisplay(false)
    Vibration.vibrate()
  }

  function getPrayerTimes(){

    return (
      <View style={styles.prayerTimes}>
        <Text style={styles.prayerTimeTitle}>Prayer Times</Text>
        {prayerTimes.map((time, index) => <Text style={styles.prayerTime} id={index}>{time.title}: {time.time}</Text>)}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {!display && 
        <View>
          {getPrayerTimes()}
        </View>}

      {display && 
      <TouchableOpacity style={styles.btn} onPress={displayTimes}>
        <Text style={styles.btnText}>Prayer Times</Text>
      </TouchableOpacity>}

      <StatusBar style="light" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#090C08'
  },
  btn: {backgroundColor: '#F8E9E9',padding: 40,borderRadius: 15},
  btnText: {fontSize: 40, fontWeight: 'bold', color: '#D72638'},
  prayerTimes: {
    flexDirection: 'column',
    justifyContent: "space-evenly",
    alignItems:'center',
    flexWrap: 'wrap',
    minHeight: "70%",
  },
  prayerTime: {
    fontSize: 40,
    color: '#EAF6FF'
  },
  prayerTimeTitle: {
    fontSize: 40,
    color: '#EAF6FF',
    textDecorationLine: 'underline'
  }

})


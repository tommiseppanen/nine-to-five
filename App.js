import React, { Component } from 'react';
import {
  AsyncStorage,
  Platform,
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = { arrivalTimes: []}
    this.dataKey = 'start-times';
  }

  async componentDidMount() {
    await this.updateState();
  }

  async updateState() {  
    const currentTimeJson = new Date().toJSON();   
    const result = await this.readData(currentTimeJson);
    
    let currentStartTime;
    if (_.isUndefined(result.currentStartTime))
    {
      await this.storeNewTime(result.data, currentTimeJson);
      currentStartTime = moment(currentTimeJson);
    }
    else{
      currentStartTime = result.currentStartTime;
    }    

    const times = this.calculateTimes(currentStartTime, currentTimeJson);

    this.setState({ arrivalTimes: result.data, currentDate: moment(new Date()).format('dddd DD.MM.'), 
      currentTimeString: times.currentTimeString, primaryTarget: times.primaryTarget.format('HH:mm'), 
      secondaryTarget: times.secondaryTarget.format('HH:mm'),
      primaryLength: times.length,
      secondaryLength: times.length+0.5
    });
  }

  async readData(currentTimeJson)
  {
    let data = [];
    let currentStartTime;

    try {      
      const value = await AsyncStorage.getItem(this.dataKey);
      let timeData = [];
      if (value !== null) {
        timeData = JSON.parse(value);

        data = timeData.reverse();
        if (data.length > 0 && data[0].slice(0,10) == currentTimeJson.slice(0,10))
        {
          currentStartTime = moment(data[0]);
          data.shift();
        }
        
        data = data.map(d => moment(d).format('dddd DD.MM HH:mm'));
      }
    } catch (error) {
        console.log(error);
    }

    return {data: data, currentStartTime: currentStartTime};
  }

  async storeNewTime(oldTimeData, newTimeJson)
  {
    let clonedTimeData = oldTimeData.slice(0);
    clonedTimeData.push(newTimeJson);
    await AsyncStorage.setItem(this.dataKey, JSON.stringify(clonedTimeData));
  }

  calculateTimes(currentStartTime, currentTimeJson) {
    const currentTimeString = currentStartTime.format('HH:mm') + " - " + currentStartTime.clone().add(480, 'minutes').format('HH:mm');
    const minutes = moment.duration(moment(currentTimeJson).diff(currentStartTime)).asMinutes();
    const baseLength = Math.floor(minutes / 30)*30;
    const target1 = currentStartTime.clone().add(baseLength + 30, 'minutes');
    const target2 = currentStartTime.clone().add(baseLength + 60, 'minutes');
    let length = Math.floor(moment.duration(target1.diff(currentStartTime)).asMinutes())/60;

    //reduce lunch break
    if (length > 4.0)
    length -= 0.5;

    return {currentTimeString: currentTimeString, primaryTarget: target1, secondaryTarget: target2, length: length}
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#3F6B9C"/>
        <View style={styles.currentDay}>
          <Text style={styles.header}>
            {this.state.currentDate}
          </Text>
          <Text style={styles.headerDetail}>
            {this.state.currentTimeString} (7.5h)
          </Text>
          <Text style={styles.headerDetail}>
            {this.state.primaryTarget} ({this.state.primaryLength}h)
          </Text>
          <Text style={styles.headerDetail}>
            {this.state.secondaryTarget} ({this.state.secondaryLength}h)
          </Text>
        </View>
        {this.state.arrivalTimes.map((time) =>
          <Text key={time} style={styles.startTime}>
          {time}
          </Text>
        )}
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  currentDay: {
    backgroundColor: '#039BE5',
    alignSelf: 'stretch',
    padding: 10,
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    margin: 10,
    color: 'white',
  },
  headerDetail: {
    fontSize: 16,
    textAlign: 'center',
    margin: 3,
    color: 'white',
  },
  startTime: {
    textAlign: 'center',
    color: '#333333',
    margin: 5,
  },
});

import React, { Component } from 'react';
import {
  AsyncStorage,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = { arrivalTimes: []}
  }

  async updateTimeData() {
    console.log("testing");
    let data = [];
    const currentDate = moment(new Date()).format('dddd DD.MM.');
    let currentStartTime;
    const currentTimeJson = new Date().toJSON();
    try {      
      const value = await AsyncStorage.getItem('times');
      console.log(value);
      let timeData = [];
      if (value !== null) {
        timeData = JSON.parse(value);  
      }
      timeData.push(currentTimeJson);
      console.log(timeData);
      await AsyncStorage.setItem('times', JSON.stringify(timeData));
      var grouped = _.groupBy(timeData, d => d.slice(0,10));
      Object.keys(grouped).forEach(function(key, index) {
        if (key !== currentTimeJson.slice(0,10))
          data.push(moment(grouped[key][0]).format('dddd DD.MM HH:mm'));
        else
          currentStartTime = moment(grouped[key][0]);
      });
    } catch (error) {
        console.log(error);
    }
    const currentTimeString = currentStartTime.format('HH:mm') + " - " + currentStartTime.clone().add(480, 'minutes').format('HH:mm');
    const minutes = moment.duration(moment(currentTimeJson).diff(currentStartTime)).asMinutes();
    const baseLength = Math.floor(minutes / 30)*30;
    const target1 = currentStartTime.clone().add(baseLength + 30, 'minutes');
    const target2 = currentStartTime.clone().add(baseLength + 60, 'minutes');

    this.setState({ arrivalTimes: data, currentDate: currentDate, 
      currentTimeString: currentTimeString, primaryTarget: target1.format('HH:mm'), 
      secondaryTarget: target2.format('HH:mm'),
      primaryLength: Math.floor(moment.duration(target1.diff(currentStartTime)).asMinutes())/60,
      secondaryLength: Math.floor(moment.duration(target2.diff(currentStartTime)).asMinutes())/60
    });
  }
  
  async componentDidMount() {
    await this.updateTimeData();
  }

  render() {
    return (
      <View style={styles.container}>
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
    backgroundColor: '#64B5F6',
    alignSelf: 'stretch',
    padding: 10,
  },
  header: {
    fontSize: 22,
    textAlign: 'center',
    margin: 10,
  },
  headerDetail: {
    fontSize: 16,
    textAlign: 'center',
    margin: 3,
  },
  startTime: {
    textAlign: 'center',
    color: '#333333',
    margin: 5,
  },
});

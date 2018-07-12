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
    try {      
      const value = await AsyncStorage.getItem('times');
      console.log(value);
      let timeData = [];
      if (value !== null) {
        timeData = JSON.parse(value);  
      }
      const currentTime = new Date().toJSON();
      timeData.push(currentTime);
      console.log(timeData);
      await AsyncStorage.setItem('times', JSON.stringify(timeData));
      var grouped = _.groupBy(timeData, d => d.slice(0,10));
      Object.keys(grouped).forEach(function(key, index) {
        if (key !== currentTime.slice(0,10))
          data.push(moment(grouped[key][0]).format('dddd DD.MM HH:mm'));
        else
          currentStartTime = moment(grouped[key][0]);
      });
    } catch (error) {
        console.log(error);
    }
    const currentTimeString = currentStartTime.format('HH:mm') + " - " + currentStartTime.add(480, 'minutes').format('HH:mm');
    this.setState({ arrivalTimes: data, currentDate: currentDate, currentTimeString: currentTimeString});
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
            17:45 (8h)
          </Text>
          <Text style={styles.headerDetail}>
            18:15 (8.5h)
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

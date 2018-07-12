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
    try {      
      const value = await AsyncStorage.getItem('times');
      console.log(value);
      let timeData = [];
      if (value !== null) {
        timeData = JSON.parse(value);  
      }
      timeData.push(new Date().toJSON());
      console.log(timeData);
      await AsyncStorage.setItem('times', JSON.stringify(timeData));
      var grouped = _.groupBy(timeData, d => d.slice(0,10));
      Object.keys(grouped).map(function(key, index) {
        data.push(moment(grouped[key][0]).format('dddd DD.MM HH:mm'));
      });
    } catch (error) {
        console.log(error);
    }
    this.setState({ arrivalTimes: data});
  }
  
  async componentDidMount() {
    await this.updateTimeData();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.currentDay}>
          <Text style={styles.header}>
            Pe 09:15 - 17:15
          </Text>
          <Text style={styles.startTime}>
            17:45 (8h)
          </Text>
          <Text style={styles.startTime}>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  currentDay: {
    backgroundColor: '#CCCCFF',
    margin: 10,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  startTime: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

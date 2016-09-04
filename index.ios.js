/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 "use strict";

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  ListView,
  RefreshControl,
  NavigatorIOS,
  TouchableHighlight,
  Image
} from 'react-native';

var HermiaMenu = React.createClass({
    render: function() {
        return (
            <TabView />
        );
    }
});

var TabView = React.createClass({
    getInitialState: function() {
        return {
            selectedTab: "Hermia5",
            hermia5Url: "",
            hermia6Url: "",
            dateString: ""
        };
    },

    createUrls: function() {
        var currentTime = new Date();
        if(currentTime.getDay() == 6) {
            currentTime.setDate(currentTime.getDate() + 2);
        }
        else if(currentTime.getDay() == 0) {
            currentTime.setDate(currentTime.getDate() + 1);
        }
        var year = currentTime.getFullYear();
        var month = (currentTime.getMonth() + 1);
        if(month < 10) {
            month = "0" + month;
        }
        var date = currentTime.getDate();
        if(date < 10) {
            date = "0" + date;
        }
        var hermia5Url = "http://www.sodexo.fi/ruokalistat/output/daily_json/134/" +
        year + "/" + month + "/" + date + "/fi";
        var hermia6Url = "http://www.sodexo.fi/ruokalistat/output/daily_json/9870/" +
        year + "/" + month + "/" + date + "/fi";

        this.setState({
            hermia5Url: hermia5Url,
            hermia6Url: hermia6Url,
            dateString: currentTime.toLocaleDateString()
        });
    },

    componentWillMount: function() {
        this.createUrls();
    },

    render: function() {
        return (
            <TabBarIOS
                style={styles.container}
                unselectedTintColor="#333333"
                tintColor="white"
                barTintColor="#3385ff">
                <TabBarIOS.Item
                    icon={require("./Resources/Restaurant-30.png")}
                    title="Hermia5"
                    selected={this.state.selectedTab === "Hermia5"}
                    onPress={() => {
                        this.createUrls();
                        this.setState({
                            selectedTab: "Hermia5"
                        });
                    }}>
                    {<NavigatorIOS
                        barTintColor="white"
                        style={styles.container}
                        initialRoute={{title: "Hermia 5 - " + this.state.dateString,
                            component: MenuView,
                            passProps: {url: this.state.hermia5Url, restaurant: "Hermia 5"}
                        }}>
                    </NavigatorIOS>}
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    icon={require("./Resources/Restaurant-30.png")}
                    title="Hermia6"
                    selected={this.state.selectedTab === "Hermia6"}
                    onPress={() => {
                        this.createUrls();
                        this.setState({
                            selectedTab: "Hermia6"
                        });
                    }}>
                    {<NavigatorIOS
                        barTintColor="white"
                        style={styles.container}
                        initialRoute={{title: "Hermia 6 - " + this.state.dateString,
                            component: MenuView,
                            passProps: {url: this.state.hermia6Url, restaurant: "Hermia 6"}
                        }}>
                    </NavigatorIOS>}
                </TabBarIOS.Item>
            </TabBarIOS>
        );
    }
});

var MenuView = React.createClass({
    getInitialState: function() {
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        var data = [];
        return {
            data: data,
            dataSource: ds.cloneWithRows(data),
            isRefreshing: false,
            url: this.props.url
        };
    },

    componentDidMount: function() {
        this.fetchMenus();
    },

    fetchMenus: function() {
        this.setState({isRefreshing: true});
        fetch(this.state.url)
            .then(response => response.json())
            .then(json => {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(json.courses),
                    isRefreshing: false
                });
            })
            .catch(error => {
                this.setState({isRefreshing: false});
                console.log("Error " + error);
            })
    },

    onRefresh: function() {
        this.fetchMenus();
    },

    rowPressed: function(rowData) {
        this.props.navigator.push({
            component: menuDetail,
            title: "Tiedot",
            passProps: rowData});
    },

    renderRow: function(rowData) {
        return (
            <TouchableHighlight underlayColor="#DDDDDD" onPress={() => this.rowPressed(rowData)}>
                <View>
                    <View style={styles.rowContainer}>
                        <Text style={styles.menuCategory}>{rowData.category}</Text>
                        <Text style={styles.menuTitle}>{rowData.title_fi}</Text>
                        <Image style={styles.arrow} source={require("./Resources/Forward-50.png")}></Image>
                    </View>
                    <View style={styles.separator}></View>
            </View>
            </TouchableHighlight>
        );
    },

    render: function() {
        return (
            <ListView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this.onRefresh}
                        tintColor="lightgrey"
                        title="Ladataan..."
                        titleColor="black"
                        colors={['#ff0000', '#00ff00', '#0000ff']}
                        progressBackgroundColor="#ffff00"
                    />
                }
                enableEmptySections={true}
                dataSource={this.state.dataSource}
                renderRow={this.renderRow}
            />
        );
    }
});

const menuDetail = (data) => {
    return (
        <View style={styles.listViewStyle}>
            <Text style={styles.menuCategoryDetail}>{data.category}</Text>
            <View style={styles.rowContainer}>
                <View style={styles.detailContainer}>
                    <Text style={styles.menuTitleDetail_fi}>{data.title_fi}</Text>
                    <Text style={styles.menuTitleDetail_en}>{data.title_en}</Text>
                    {data.properties &&
                    <Text style={styles.propertiesDetail}>{data.properties}</Text>}
                </View>
                <Text style={styles.menuPrice}>{data.price}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tabContent: {
      flex: 1,
      alignItems: 'center',
    },
    tabText: {
      color: 'black',
      margin: 50,
    },
    container: {
        flex: 1
    },
    detailContainer: {
        flex: 5
    },
    menuTitle: {
        flex: 1,
        color: "black"
    },
    menuTitleDetail_fi: {
        flex: 1,
        padding: 5
    },
    menuTitleDetail_en: {
        flex: 1,
        paddingLeft: 5,
        paddingBottom: 10,
        fontStyle: "italic"
    },
    propertiesDetail: {
        flex: 1,
        padding: 5,
        fontStyle: "italic"
    },
    menuPrice: {
        flex: 1,
        padding: 5,
        fontWeight: "bold",
        fontStyle: "italic"
    },
    menuCategory: {
        flex: 1,
        fontWeight: "bold"
    },
    menuCategoryDetail: {
        flex: 1,
        fontWeight: "bold",
        padding: 15,
    },
    separator: {
        height: 1,
        backgroundColor: "#DDDDDD"
    },
    rowContainer: {
        flexDirection: "row",
        padding: 10
    },
    appTitle: {
        color: "black",
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 30,
        marginBottom: 10,
    },
    listViewStyle: {
        marginTop: 64
    },
    arrow: {
        width: 20,
        height: 20,
        marginLeft: 20
    }
});

AppRegistry.registerComponent('HermiaMenu', () => HermiaMenu);

var Service, Characteristic;
var JSONRequest = require("jsonrequest");
var inherits = require('util').inherits;
var pollingtoevent = require('polling-to-event');

// Get data from config file 
function Domotiga(log, config) {
    this.log = log;
    this.config = {
        host: config.host || 'localhost',
        port: config.port || 9090,
        service: config.service,
        device: config.device,
        manufacturer: config.manufacturer,
        model: config.model,
        valueTemperature: config.valueTemperature,
        valueHumidity: config.valueHumidity,
        valueAirPressure: config.valueAirPressure,
        valueBattery: config.valueBattery,
        valueContact: config.valueContact,
        valueSwitch: config.valueSwitch,
        valueDoor: config.valueDoor,
        valueWindow: config.valueWindow,
        valueWindowCovering: config.valueWindowCovering,
        valueAirQuality: config.valueAirQuality,
        valueOutlet: config.valueOutlet,
        valueLeakSensor: config.valueLeakSensor,
        valueMotionSensor: config.valueMotionSensor,
        valuePowerConsumption: config.valuePowerConsumption,
        valueTotalPowerConsumption: config.valueTotalPowerConsumption,
        pollInMs: config.pollInMs,
        name: config.name || NA,
        lowbattery: config.lowbattery
    };

    var that = this;
    // Status Polling
    if (this.config.pollInMs) {

        var pollingInterval = Number(this.config.pollInMs);

        var statusemitter = pollingtoevent(function (done) {
            that.domotigaGetValue(that.primaryValue, function (error, result) {
                if (error) {
                    that.log.error('getState GetValue failed: %s', error.message);
                    callback(error);
                } else {
                    done(null, result);
                }
            })
        }, {
            longpolling: true,
            interval: pollingInterval,
            longpollEventName: "statuspoll"
        });

        statusemitter.on("statuspoll", function (data) {
            that.log(that.config.name, "received data:", "state is currently", data);
            // Todo: cache values and only update database if value has changed
            switch (that.config.service) {
                case "Switch":
                    if (that.primaryservice) {
                        if (data.toLowerCase() == "on")
                            that.primaryservice.getCharacteristic(Characteristic.On).setValue(1);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.On).setValue(0);
                        that.log("Switching state...");
                    }
                    break;
                case "Door":
                    if (that.primaryservice) {
                        if (data.toLowerCase() == "1")
                            that.primaryservice.getCharacteristic(Characteristic.TargetPositon).setValue(100);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.Targetpositon).setValue(0);
                        that.log("Switching door state...");
                    }
                    break;
                case "Window":
                    if (that.primaryservice) {
                        if (data.toLowerCase() == "1")
                            that.primaryservice.getCharacteristic(Characteristic.TargetPositon).setValue(100);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.Targetpositon).setValue(0);
                        that.log("Switching window state...");
                    }
                    break;
                case "WindowCovering":
                    if (that.primaryservice) {
                        if (data.toLowerCase() == "1")
                            that.primaryservice.getCharacteristic(Characteristic.TargetPositon).setValue(100);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.Targetpositon).setValue(0);
                        that.log("Switching window covering state...");
                    }
                    break;
                case "Outlet":
                    if (that.primaryservice) {
                        if (data.toLowerCase() == "on")
                            that.primaryservice.getCharacteristic(Characteristic.On).setValue(1);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.On).setValue(0);
                        that.log("Switching outlet state...");
                    }
                    break;
                case "Contact":
                    if (that.primaryservice) {
                        if (data.toLowerCase() == "on")
                            that.primaryservice.getCharacteristic(Characteristic.ContactSensorState).setValue(Characteristic.ContactSensorState.CONTACT_DETECTED);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.ContactSensorState).setValue(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
                        that.log("Changing contact state...");
                    }
                    break;
                case "LeakSensor":
                    if (that.primaryservice) {
                        if (Number(data) == 0)
                            that.primaryservice.getCharacteristic(Characteristic.LeakDetected).setValue(Characteristic.LeakDetected.LEAK_NOT_DETECTED);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.LeakDetected).setValue(Characteristic.LeakDetected.LEAK_DETECTED);

                        that.log("Changing leaksensor state...");
                    }
                    break;
                case "MotionSensor":
                    if (that.primaryservice) {
                        if (Number(data) == 0)
                            that.primaryservice.getCharacteristic(Characteristic.MotionDetected).setValue(0);
                        else
                            that.primaryservice.getCharacteristic(Characteristic.MotionDetected).setValue(1);

                        that.log("Changing motionsensor state...");
                    }
                    break;
                    break;
            }
        });
    }
}

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    ////////////////////////////// Custom characteristics //////////////////////////////
    EvePowerConsumption = function () {
        Characteristic.call(this, 'Consumption', 'E863F10D-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.UINT16,
            unit: "watts",
            maxValue: 1000000000,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(EvePowerConsumption, Characteristic);

    EveTotalPowerConsumption = function () {
        Characteristic.call(this, 'Total Consumption', 'E863F10C-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.FLOAT, // Deviation from Eve Energy observed type
            unit: "kilowatthours",
            maxValue: 1000000000,
            minValue: 0,
            minStep: 0.001,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(EveTotalPowerConsumption, Characteristic);

    EveRoomAirQuality = function () {
        Characteristic.call(this, 'Eve Air Quality', 'E863F10B-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.UINT16,
            unit: "ppm",
            maxValue: 5000,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(EveRoomAirQuality, Characteristic);

    EveBatteryLevel = function () {
        Characteristic.call(this, 'Eve Battery Level', 'E863F11B-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.UINT16,
            unit: "PERCENTAGE",
            maxValue: 100,
            minValue: 0,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(EveBatteryLevel, Characteristic);

    EveAirPressure = function () {
        //todo: only rough guess of extreme values -> use correct min/max if known
        Characteristic.call(this, 'Eve AirPressure', 'E863F10F-079E-48FF-8F27-9C2605A29F52');
        this.setProps({
            format: Characteristic.Formats.UINT16,
            unit: "hPa",
            maxValue: 1085,
            minValue: 870,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
        });
        this.value = this.getDefaultValue();
    };
    inherits(EveAirPressure, Characteristic);


    ////////////////////////////// Custom services //////////////////////////////
    PowerMeterService = function (displayName, subtype) {
        Service.call(this, displayName, '00000001-0000-1777-8000-775D67EC4377', subtype);
        // Required Characteristics
        this.addCharacteristic(EvePowerConsumption);
        // Optional Characteristics
        this.addOptionalCharacteristic(EveTotalPowerConsumption);
    };
    inherits(PowerMeterService, Service);

    //Eve service (custom UUID)
    EveRoomService = function (displayName, subtype) {
        Service.call(this, displayName, 'E863F002-079E-48FF-8F27-9C2605A29F52', subtype);
        // Required Characteristics
        this.addCharacteristic(EveRoomAirQuality);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic.CurrentRelativeHumidity);
    };
    inherits(EveRoomService, Service);

    /////////////////////////////////////////////////////////////////////////////////////////////
    //Eve service (custom UUID)
    EveWeatherService = function (displayName, subtype) {
        Service.call(this, displayName, 'E863F001-079E-48FF-8F27-9C2605A29F52', subtype);
        // Required Characteristics
        this.addCharacteristic(EveAirPressure);
        // Optional Characteristics
        this.addOptionalCharacteristic(Characteristic.CurrentRelativeHumidity);
        this.addOptionalCharacteristic(Characteristic.CurrentTemperature);
        this.addOptionalCharacteristic(EveBatteryLevel);
    };
    inherits(EveWeatherService, Service);

    homebridge.registerAccessory("homebridge-domotiga", "Domotiga", Domotiga);
}


Domotiga.prototype = {
    identify: function (callback) {
        this.log("Identify requested!");
        callback(); // success
    },
    domotigaGetValue: function (deviceValueNo, callback) {
        var that = this;
        JSONRequest('http://' + that.config.host + ':' + that.config.port, {
            jsonrpc: "2.0",
            method: "device.get",
            params: {
                "device_id": that.config.device
            },
            id: 1
        }, function (err, data) {
            if (err) {
                that.log.error("Sorry err: ", err);
                callback(err);
            } else {
                item = Number(deviceValueNo) - 1;
                //that.log("data.result:", data.result);
                //that.log( "data.result.values[item].value", data.result.values[item].value);
                callback(null, data.result.values[item].value);
            }
        });
    },
    domotigaSetValue: function (deviceValueNo, value, callback) {
        var that = this;
        JSONRequest('http://' + that.config.host + ':' + that.config.port, {
            jsonrpc: "2.0",
            method: "device.set",
            params: {
                "device_id": that.config.device,
                "valuenum": deviceValueNo,
                "value": value
            },
            id: 1
        }, function (err, data) {
            //that.log("data:", data);
            if (err) {
                that.log.error("Sorry err: ", err);
                callback(err);
            } else {
                callback();
            }
        });
    },
    getCurrentRelativeHumidity: function (callback) {
        var that = this;
        that.log("getting CurrentRelativeHumidity for " + that.config.name);
        this.domotigaGetValue(that.config.valueHumidity, function (error, result) {
            if (error) {
                that.log.error('CurrentRelativeHumidity GetValue failed: %s', error.message);
                callback(error);
            } else {
                callback(null, Number(result));
            }
        }.bind(this));
    },
    getCurrentTemperature: function (callback) {
        var that = this;
        that.log("getting Temperature for " + that.config.name);
        this.domotigaGetValue(that.config.valueTemperature, function (error, result) {
            if (error) {
                that.log.error('CurrentTemperature GetValue failed: %s', error.message);
                callback(error);
            } else {
                callback(null, Number(result));
            }
        }.bind(this));
    },
    getTemperatureUnits: function (callback) {
        var that = this;
        that.log("getting Temperature unit for " + that.config.name);
        // 1 = F and 0 = C
        callback(null, 0);
    },
    getCurrentAirPressure: function (callback) {
        var that = this;
        that.log("getting CurrentAirPressure for " + that.config.name);
        this.domotigaGetValue(that.config.valueAirPressure, function (error, result) {
            if (error) {
                that.log.error('CurrentAirPressure GetValue failed: %s', error.message);
                callback(error);
            } else {
                callback(null, Number(result));
            }
        }.bind(this));
    },
    getContactState: function (callback) {
        var that = this;
        that.log("getting ContactState for " + that.config.name);
        this.domotigaGetValue(that.config.valueContact, function (error, result) {
            if (error) {
                that.log.error('getGetContactState GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (result.toLowerCase() == "on")
                    callback(null, Characteristic.ContactSensorState.CONTACT_DETECTED);
                else
                    callback(null, Characteristic.ContactSensorState.CONTACT_NOT_DETECTED);
            }
        }.bind(this));
    },
    getLeakSensorState: function (callback) {
        var that = this;
        that.log("getting LeakSensorState for " + that.config.name);
        this.domotigaGetValue(that.config.valueLeakSensor, function (error, result) {
            if (error) {
                that.log.error('getLeakSensorState GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (Number(result) == 0)
                    callback(null, Characteristic.LeakDetected.LEAK_NOT_DETECTED);
                else
                    callback(null, Characteristic.LeakDetected.LEAK_DETECTED);
            }
        }.bind(this));
    },
    getOutletState: function (callback) {
        var that = this;
        that.log("getting OutletState for " + that.config.name);
        this.domotigaGetValue(that.config.valueOutlet, function (error, result) {
            if (error) {
                that.log.error('getGetOutletState GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (result.toLowerCase() == "on")
                    callback(null, 0);
                else
                    callback(null, 1);
            }
        }.bind(this));
    },
    setOutletState: function (boolvalue, callback) {
        var that = this;
        that.log("Setting outlet state for '%s' to %s", that.config.name, boolvalue);

        if (boolvalue == 1)
            outletState = "On";
        else
            outletState = "Off";

        var callbackWasCalled = false;
        that.domotigaSetValue(that.config.valueOutlet, outletState, function (err) {
            if (callbackWasCalled)
                that.log.warn("WARN: domotigaSetValue called its callback more than once! Discarding the second one.");

            callbackWasCalled = true;
            if (!err) {
                that.log("Successfully set outlet state on the '%s' to %s", that.config.name, outletState);
                callback(null);
            } else {
                that.log.error("Error setting outlet state to %s on the '%s'", outletState, that.config.name);
                callback(err);
            }
        }.bind(this));
    },
    getOutletInUse: function (callback) {
        var that = this;
        that.log("getting OutletInUse for " + that.config.name);
        this.domotigaGetValue(that.config.valueOutlet, function (error, result) {
            if (error) {
                that.log.error('getOutletInUse GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (result.toLowerCase() == "on")
                    callback(null, false);
                else
                    callback(null, true);
            }
        }.bind(this));
    },
    getCurrentAirQuality: function (callback) {
        var that = this;
        that.log("getting airquality for " + that.config.name);

        this.domotigaGetValue(that.config.valueAirQuality, function (error, result) {
            if (error) {
                that.log.error('CurrentAirQuality GetValue failed: %s', error.message);
                callback(error);
            } else {
                voc = Number(result);
                that.log('CurrentAirQuality level: %s', voc);
                if (voc > 1500)
                    callback(null, Characteristic.AirQuality.POOR);
                else if (voc > 1000)
                    callback(null, Characteristic.AirQuality.INFERIOR);
                else if (voc > 800)
                    callback(null, Characteristic.AirQuality.FAIR);
                else if (voc > 600)
                    callback(null, Characteristic.AirQuality.GOOD);
                else if (voc > 0)
                    callback(null, Characteristic.AirQuality.EXCELLENT);
                else
                    callback(null, Characteristic.AirQuality.UNKNOWN);
            }
        }.bind(this));
    },
    // Eve characteristic (custom UUID)    
    getCurrentEveAirQuality: function (callback) {
        // Custom Eve intervals:
        //    0... 700 : Exzellent
        //  700...1100 : Good
        // 1100...1600 : Acceptable
        // 1600...2000 : Moderate
        //      > 2000 : Bad	
        var that = this;
        that.log("getting Eve room airquality for " + that.config.name);
        this.domotigaGetValue(that.config.valueAirQuality, function (error, result) {
            if (error) {
                that.log.error('CurrentEveAirQuality GetValue failed: %s', error.message);
                callback(error);
            } else {
                voc = Number(result);
                if (voc < 0)
                    voc = 0;
                callback(null, voc);
            }
        }.bind(this));
    },
    // Eve characteristic (custom UUID)    
    getEvePowerConsumption: function (callback) {
        var that = this;
        that.log("getting EvePowerConsumption for " + that.config.name);
        this.domotigaGetValue(that.config.valuePowerConsumption, function (error, result) {
            if (error) {
                that.log.error('PowerConsumption GetValue failed: %s', error.message);
                callback(error);
            } else {
                callback(null, Math.round(Number(result))); // W
            }
        }.bind(this));
    },
    // Eve characteristic (custom UUID)   
    getEveTotalPowerConsumption: function (callback) {
        var that = this;
        that.log("getting EveTotalPowerConsumption for " + that.config.name);
        this.domotigaGetValue(that.config.valueTotalPowerConsumption, function (error, result) {
            if (error) {
                that.log.error('EveTotalPowerConsumption GetValue failed: %s', error.message);
                callback(error);
            } else {
                callback(null, Math.round(Number(result) * 1000.0) / 1000.0); // kWh
            }
        }.bind(this));
    },
    getCurrentBatteryLevel: function (callback) {
        var that = this;
        that.log("getting Battery level for " + that.config.name);
        this.domotigaGetValue(that.config.valueBattery, function (error, result) {
            if (error) {
                that.log.error('CurrentBattery GetValue failed: %s', error.message);
                callback(error);
            } else {
                //that.log('CurrentBattery level Number(result): %s', Number(result));
                remaining = parseInt(Number(result) * 100 / 5000, 10);
                that.log('CurrentBattery level: %s', remaining);
                if (remaining > 100)
                    remaining = 100;
                else if (remaining < 0)
                    remaining = 0;
                callback(null, remaining);
            }
        }.bind(this));
    },
    getLowBatteryStatus: function (callback) {
        var that = this;
        that.log("getting BatteryStatus for " + that.config.name);
        this.domotigaGetValue(that.config.valueBattery, function (error, result) {
            if (error) {
                that.log.error('BatteryStatus GetValue failed: %s', error.message);
                callback(error);
            } else {
                var value = Number(result);
                if (isNaN(value) || value < Number(that.config.lowbattery))
                    callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
                else
                    callback(null, Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
            }
        }.bind(this));
    },
    getMotionDetected: function (callback) {
        var that = this;
        that.log("getting MotionDetected for " + that.config.name);
        this.domotigaGetValue(that.config.valueMotionSensor, function (error, result) {
            if (error) {
                that.log.error('getMotionDetected GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (Number(result) == 0)
                    callback(null, 0);
                else
                    callback(null, 1);
            }
        }.bind(this));
    },
    getSwitchState: function (callback) {
        var that = this;
        that.log("getting SwitchState for " + that.config.name);
        this.domotigaGetValue(that.config.valueSwitch, function (error, result) {
            if (error) {
                that.log.error('getSwitchState GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (result.toLowerCase() == "on")
                    callback(null, 1);
                else
                    callback(null, 0);
            }
        }.bind(this));
    },
    setSwitchState: function (switchOn, callback) {
        var that = this;
        that.log("Setting SwitchState for '%s' to %s", that.config.name, switchOn);

        if (switchOn == 1)
            switchState = "On";
        else
            switchState = "Off";

        var callbackWasCalled = false;
        that.domotigaSetValue(that.config.valueSwitch, switchState, function (err) {
            if (callbackWasCalled) {
                that.log.warn("WARN: domotigaSetValue called its callback more than once! Discarding the second one.");
            }
            callbackWasCalled = true;
            if (!err) {
                that.log("Successfully set switch state on the '%s' to %s", that.config.name, switchOn);
                callback(null);
            } else {
                that.log.error("Error setting switch state to %s on the '%s'", switchOn, that.config.name);
                callback(err);
            }
        }.bind(this));
    },
    getDoorPositionState: function (callback) {
        // At this time the value property of PositionState is always mapped to stopped
        callback(null, Characteristic.PositionState.STOPPED);
    },
    getDoorPosition: function (callback) {
        var that = this;
        that.log("Getting DoorPosition for " + that.config.name);
        this.domotigaGetValue(that.config.valueDoor, function (error, result) {
            if (error) {
                that.log.error('getDoorPosition GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (result.toLowerCase() == "0")
                    callback(null, 0);
                else
                    callback(null, 100);
            }
        }.bind(this));
    },
    setDoorPosition: function (targetPosition, callback) {
        var that = this;
        that.log("Setting door position for '%s' to %s", that.config.name, targetPosition);

        // At this time we do not use percentage values: 1 = open, 0 = closed
        if (targetPosition == 0)
            doorPosition = "0";
        else
            doorPosition = "1";

        var callbackWasCalled = false;
        that.domotigaSetValue(that.config.valueDoor, doorPosition, function (err) {
            if (callbackWasCalled) {
                that.log.warn("WARN: domotigaSetValue called its callback more than once! Discarding the second one.");
            }
            callbackWasCalled = true;
            if (!err) {
                that.log("Successfully set door position on the '%s' to %s", that.config.name, targetPosition);
                callback(null);
            } else {
                that.log.error("Error setting door position to %s on the '%s'", targetPosition, that.config.name);
                callback(err);
            }
        }.bind(this));
    },
    getWindowPositionState: function (callback) {
        // At this time the value property of PositionState is always mapped to stopped
        callback(null, Characteristic.PositionState.STOPPED);
    },
    getWindowPosition: function (callback) {
        var that = this;
        that.log("Getting WindowPosition for " + that.config.name);
        this.domotigaGetValue(that.config.valueWindow, function (error, result) {
            if (error) {
                that.log.error('getWindowPosition GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (result.toLowerCase() == "0")
                    callback(null, 0);
                else
                    callback(null, 100);
            }
        }.bind(this));
    },
    setWindowPosition: function (targetPosition, callback) {
        var that = this;
        that.log("Setting window position for '%s' to %s", that.config.name, targetPosition);

        if (targetPosition == 0)
            windowPosition = "0";
        else
            windowPosition = "1";

        var callbackWasCalled = false;
        that.domotigaSetValue(that.config.valueWindow, windowPosition, function (err) {
            if (callbackWasCalled) {
                that.log.warn("WARN: domotigaSetValue called its callback more than once! Discarding the second one.");
            }
            callbackWasCalled = true;
            if (!err) {
                that.log("Successfully set window position on the '%s' to %s", that.config.name, targetPosition);
                callback(null);
            } else {
                that.log.error("Error setting window position to %s on the '%s'", targetPosition, that.config.name);
                callback(err);
            }
        }.bind(this));
    },
    getWindowCoveringPositionState: function (callback) {
        // At this time the value property of PositionState is always mapped to stopped
        callback(null, Characteristic.PositionState.STOPPED);
    },
    getWindowCoveringPosition: function (callback) {
        var that = this;
        that.log("Getting window covering position for " + that.config.name);
        this.domotigaGetValue(that.config.valueWindowCovering, function (error, result) {
            if (error) {
                that.log.error('getWindowCoveringPosition GetValue failed: %s', error.message);
                callback(error);
            } else {
                if (result.toLowerCase() == "0")
                    callback(null, 0);
                else
                    callback(null, 100);
            }
        }.bind(this));
    },
    setWindowCoveringPosition: function (targetPosition, callback) {
        var that = this;
        that.log("Setting window covering position for '%s' to %s", that.config.name, targetPosition);

        if (targetPosition == 0)
            coveringPosition = "0";
        else
            coveringPosition = "1";

        var callbackWasCalled = false;
        that.domotigaSetValue(that.config.valueWindowCovering, coveringPosition, function (err) {
            if (callbackWasCalled) {
                that.log.warn("WARN: domotigaSetValue called its callback more than once! Discarding the second one.");
            }
            callbackWasCalled = true;
            if (!err) {
                that.log("Successfully set window covering position on the '%s' to %s", that.config.name, targetPosition);
                callback(null);
            } else {
                that.log.error("Error setting window covering position to %s on the '%s'", targetPosition, that.config.name);
                callback(err);
            }
        }.bind(this));
    },
    getServices: function () {
        // You can OPTIONALLY create an information service if you wish to override
        // the default values for things like serial number, model, etc.
        var informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, 'Domotiga: ' + (this.config.manufacturer ? this.config.manufacturer : '<unknown>'))
            .setCharacteristic(Characteristic.Model, 'Domotiga: ' + (this.config.model ? this.config.model : '<unknown>'))
            .setCharacteristic(Characteristic.SerialNumber, ("Domotiga device " + this.config.device + this.config.name));

        var services = [informationService];

        // Create primary service
        switch (this.config.service) {

            case "TemperatureSensor":
                this.primaryservice = new Service.TemperatureSensor(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.CurrentTemperature)
                .setProps({ minValue: -55, maxValue: 125 })
                    .on('get', this.getCurrentTemperature.bind(this));
                break;

            case "HumiditySensor":
                this.primaryservice = new Service.HumiditySensor(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.CurrentRelativeHumidity)
                    .on('get', this.getCurrentRelativeHumidity.bind(this));
                break;

            case "Contact":
                this.primaryservice = new Service.ContactSensor(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.ContactSensorState)
                    .on('get', this.getContactState.bind(this));
                this.primaryValue = this.config.valueContact;
                break;

            case "LeakSensor":
                this.primaryservice = new Service.LeakSensor(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.LeakDetected)
                    .on('get', this.getLeakSensorState.bind(this));
                this.primaryValue = this.config.valueLeakSensor;
                break;

            case "MotionSensor":
                this.primaryservice = new Service.MotionSensor(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.MotionDetected)
                    .on('get', this.getMotionDetected.bind(this));
                this.primaryValue = this.config.valueMotionSensor;
                break;

            case "Switch":
                this.primaryservice = new Service.Switch(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.On)
                    .on('get', this.getSwitchState.bind(this))
                    .on('set', this.setSwitchState.bind(this));
                this.primaryValue = this.config.valueSwitch;
                break;

            case "Door":
                this.primaryservice = new Service.Door(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.CurrentPosition)
                    .on('get', this.getDoorPosition.bind(this));
                this.primaryservice.getCharacteristic(Characteristic.TargetPosition)
                    .on('get', this.getDoorPosition.bind(this))
                    .on('set', this.setDoorPosition.bind(this));
                this.primaryservice.getCharacteristic(Characteristic.PositionState)
                    .on('get', this.getDoorPositionState.bind(this));
                this.primaryValue = this.config.valueDoor;
                break;

            case "Window":
                this.primaryservice = new Service.Window(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.CurrentPosition)
                    .on('get', this.getWindowPosition.bind(this));
                this.primaryservice.getCharacteristic(Characteristic.TargetPosition)
                    .on('get', this.getWindowPosition.bind(this))
                    .on('set', this.setWindowPosition.bind(this));
                this.primaryservice.getCharacteristic(Characteristic.PositionState)
                    .on('get', this.getWindowPositionState.bind(this));
                this.primaryValue = this.config.valueWindow;
                break;

            case "WindowCovering":
                this.primaryservice = new Service.WindowCovering(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.CurrentPosition)
                    .on('get', this.getWindowCoveringPosition.bind(this));
                this.primaryservice.getCharacteristic(Characteristic.TargetPosition)
                    .on('get', this.getWindowCoveringPosition.bind(this))
                    .on('set', this.setWindowCoveringPosition.bind(this));
                this.primaryservice.getCharacteristic(Characteristic.PositionState)
                    .on('get', this.getWindowCoveringPositionState.bind(this));
                this.primaryValue = this.config.valueWindowCovering;
                break;
                
            case "Outlet":
                this.primaryservice = new Service.Outlet(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.On)
                    .on('get', this.getOutletState.bind(this))
                    .on('set', this.setOutletState.bind(this));
                this.primaryservice.getCharacteristic(Characteristic.OutletInUse)
                    .on('get', this.getOutletInUse.bind(this));

                this.primaryValue = this.config.valueOutlet;
                break;

            case "AirQualitySensor":
                this.primaryservice = new Service.AirQualitySensor(this.config.service);
                this.primaryservice.getCharacteristic(Characteristic.AirQuality)
                    .on('get', this.getCurrentAirQuality.bind(this));
                break;

            case "FakeEveAirQualitySensor":
                this.primaryservice = new EveRoomService("Eve Room");
                this.primaryservice.getCharacteristic(EveRoomAirQuality)
                    .on('get', this.getCurrentEveAirQuality.bind(this));
                break;

            case "FakeEveWeatherSensor":
                this.primaryservice = new EveWeatherService("Eve Weather");
                this.primaryservice.getCharacteristic(EveAirPressure)
                    .on('get', this.getCurrentAirPressure.bind(this));
                break;

            case "FakeEveWeatherSensorWithLog":
                this.primaryservice = new EveWeatherService("Eve Weather");
                this.primaryservice.getCharacteristic(EveAirPressure)
                    .on('get', this.getCurrentAirPressure.bind(this));
                break;

            case "Powermeter":
                this.primaryservice = new PowerMeterService(this.config.service);
                this.primaryservice.getCharacteristic(EvePowerConsumption)
                    .on('get', this.getEvePowerConsumption.bind(this));
                break;

            default:
                that.log.warn('WARN: Service %s %s unknown, skipping...', this.config.service, this.config.name);
                break;
        }

        services = services.concat(this.primaryservice);
        if (services.length === 1) {
            this.log.warning("WARN: Only the InformationService was successfully configured for " + this.config.name + "! No device services available!");
            return services;
        }


        var service = services[1];

        // Add optional characteristics...
        if (this.config.valueTemperature && (this.config.service != "TemperatureSensor")) {
            service.addCharacteristic(Characteristic.CurrentTemperature)
            .setProps({ minValue: -55, maxValue: 125 })
                .on('get', this.getCurrentTemperature.bind(this));
        }
        if (this.config.valueHumidity && (this.config.service != "HumiditySensor")) {
            service.addCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on('get', this.getCurrentRelativeHumidity.bind(this));
        }
        if (this.config.valueBattery) {
            service.addCharacteristic(Characteristic.BatteryLevel)
                .on('get', this.getCurrentBatteryLevel.bind(this));
        }
        if (this.config.lowbattery) {
            service.addCharacteristic(Characteristic.StatusLowBattery)
                .on('get', this.getLowBatteryStatus.bind(this));
        }

        // Eve characteristic (custom UUID)
        if (this.config.valueAirPressure &&
            (this.config.service != "FakeEveWeatherSensor") && (this.config.service != "FakeEveWeatherSensorWithLog")) {
            service.addCharacteristic(EveAirPressure)
                .on('get', this.getCurrentAirPressure.bind(this));
        }
        // Eve characteristic (custom UUID)
        if (this.config.valueAirQuality &&
            (this.config.service != "AirQualitySensor") && (this.config.service != "FakeEveAirQualitySensor")) {
            service.addCharacteristic(Characteristic.AirQuality)
                .on('get', this.getCurrentEveAirQuality.bind(this));
        }
        // Eve characteristic (custom UUID)
        if (this.config.valuePowerConsumption && (this.config.service != "Powermeter")) {
            service.addCharacteristic(EvePowerConsumption)
                .on('get', this.getEvePowerConsumption.bind(this));
        }
        // Eve characteristic (custom UUID)
        if (this.config.valueTotalPowerConsumption) {
            service.addCharacteristic(EveTotalPowerConsumption)
                .on('get', this.getEveTotalPowerConsumption.bind(this));
        }
        return services;
    }
};

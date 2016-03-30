# homebridge-domotiga
Supports [Domotiga](https://domotiga.nl) devices on [HomeBridge](https://github.com/nfarina/homebridge) platform.

The latest version (work in progress) supports following services:

- ```TempHygroMeter``` (temperature + optional humidity/air pressure/battery/low battery warning) 
- ```AirQualitySensor``` (air quality + opt. temperature/humidity/air pressure/battery/low battery warning) 
- ```FakeEveAirQualitySensor``` (custom Eve service, same as AirQualitySensor with additional ppm value in Eve app)
- ```Contact``` (contact state + opt. battery/low battery warning) 
- ```Switch``` (get/set switch state) 
- ```Outlet``` (get/set outlet state + opt. power consumption/total power consumption) 
- ```Powermeter``` (power consumption + opt. total power consumption) 

Domotiga device value numbers (e.g. which device value represents temperature) can be assigned directly within the config.json file.

# Installation

1. Install homebridge using:  ```npm install -g homebridge```
2. Install this plugin using: ```npm install -g git+https://github.com/Samfox2/homebridge-domotiga.git``` or ```npm install -g homebridge-domotiga```
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Configuration

Configuration sample:

 ```
"accessories": [
          {
            "accessory": "Domotiga",
            "name": "Sensor garden",
            "host": "localhost",
            "port": "9090",
            "service": "TempHygroMeter",
            "manufacturer": "DIY",
            "model": "TinyTX",
            "device": "81",
            "valueTemperature": "1",
            "valueHumidity":    "2",
            "valueAirPressure": "3",
            "valueBattery":     "4",
            "lowbattery": "3000"
          },
          {
            "accessory": "Domotiga",
            "name": "Combined AirQualitySensor livingroom",
            "host": "DomotiGa",
            "port": "9090",
            "service": "AirQualitySensor",
            "device": "83",
            "valueAirQuality":  "1",
            "valueTemperature": "2",
            "valueHumidity":    "3",
            "valueAirPressure": "4",            
            "valueBattery":     "5",
            "lowbattery": "3000"
          },
          {
            "accessory": "Domotiga",
            "name": "Combined AirQualitySensor with ppm display",
            "host": "DomotiGa",
            "port": "9090",
            "service": "FakeEveAirQualitySensor",
            "device": "89",
            "valueAirQuality":  "1",
            "valueTemperature": "2",
            "valueHumidity":    "3",
            "valueAirPressure": "4",            
            "valueBattery":     "5",
            "lowbattery": "3000"
          }, 
          {
            "accessory": "Domotiga",
            "name": "AirQualitySensor bedroom without battery",
            "host": "DomotiGa",
            "port": "9090",
            "service": "AirQualitySensor",
            "device": "82",
            "valueAirQuality": "1"
          },         
          {
            "accessory": "Domotiga",
            "name": "PC",
            "host": "192.168.0.xxx",
            "port": "9090",
            "service": "Contact",
            "device": "77",
            "valueContact": "1",
            "valueBattery":    "2",
            "lowbattery": "3000"
          },
          {
            "accessory": "Domotiga",
            "name": "Printer",
            "host": "192.168.0.xxx",
            "port": "9090",
            "service": "Switch",
            "device": "79",
            "valueSwitch": "1"
          },
          {
            "accessory": "Domotiga",
            "name": "Outlet",
            "host": "192.168.0.xxx",
            "port": "9090",
            "service": "Outlet",
            "device": "72",
            "valueOutlet": "1",
            "valuePowerConsumption": "3",
            "valueTotalPowerConsumption": "7"
          },
          {
            "accessory": "Domotiga",
            "name": "Powermeter basement",
            "host": "192.168.0.xxx",
            "port": "9090",
            "service": "Powermeter",
            "device": "44",
            "valuePowerConsumption": "1",
            "valueTotalPowerConsumption": "2"
        }
    ]
```

Fields:

* ```"accessory":``` Must always be "Domotiga" (required)
* ```"name":``` Can be anything
* ```"host":``` The hostname or ip of the machine running Domotiga (required)
* ```"port":``` The port that Domotiga is using (usually 9090) (required)
* ```"service":``` Service that Domotiga device represents (required)
* ```"manufacturer":``` Manufacturer of accessory (optional)
* ```"model":``` Model of accessory (optional)
* ```"device":```  Domotiga device no. (required)
* ```"valueTemperature":``` Domotiga device value no. of temperature in °C (required for "TempHygroMeter")
* ```"valueHumidity":``` Value no. of humidity in % (optional for "TempHygroMeter")
* ```"valueAirPressure":``` Value no. of air pressure in hPa (optional Eve characteristic for "TempHygroMeter")
* ```"valueAirQuality":```  Value no. of the air quality VOC (required for "AirQualitySensor")
* ```"valueContact":```  Value no. of the contact (required for "Contact")
* ```"valueSwitch":```   Value no. of the switch (required for "Switch")
* ```"valueOutlet":```   Value no. of the outlet (required for "Outlet")


Not yet supported by all homekit apps:

* ```"valuePowerConsumption":```  Value no. of the consumption in W (required for custom "Powermeter" and optional Eve characteristic for "Outlet")
* ```"valueTotalPowerConsumption":```  Value no. of the total consumption in kWh (optional for custom "Powermeter" and Eve characteristic for "Outlet")
* ```"valueBattery":```  Value no. of battery
* ```"lowbattery":```    Min. battery level which activates "low battery warning" in mV


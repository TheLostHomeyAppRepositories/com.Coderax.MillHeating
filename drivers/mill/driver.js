'use strict';

const { Driver } = require('homey');
const Homey = require('homey');
const { debug } = require('./../../lib/util');

class MillDriver extends Driver {
  async onInit() {
    this.log(this.homey.app.isConnected());
  }

  async onPairListDevices() {
    if (!this.homey.app.isConnected()) {
      
      this.log('Unable to pair, not authenticated');
      this.log(new Error(this.homey.__('pair.messages.notAuthorized')));
    } else {
      this.log('Pairing');
      const millApi = this.homey.app.getMillApi();
      const homes = await millApi.listHomes();
      this.log(`Found following homes: ${homes.ownHouses.map(home => `${home.name} (${home.id})`).join(', ')}`);

      const rooms = await Promise.all(homes.ownHouses.map(async (home) => {
        const rooms = await millApi.listRooms(home.id);
        this.log(`Found following rooms in ${home.name}: ${rooms.rooms.map(room => `${room.name} (${room.id})`).join(', ')}`);

        return rooms.rooms.map(room => (
          {
            name: room.name,
            data: {
              id: room.id,
              homeId: homes.ownHouses[0].id,
              homeName: homes.ownHouses[0].name,
              name: room.name,
              temp: room.averageTemperature,
              alive: room.isRoomOnline === true
            }
          }
        ));
      }));
      return rooms.reduce((acc, val) => acc.concat(val), []);
    }
  }
}

module.exports = MillDriver;

/*jshint -W079 */
'use strict';

module.exports = function(rooms) {
  return rooms.filter(function(room) {
    if (room.room && room.room._id) {
      return true;
    } else {
      return false;
    }
  });
};

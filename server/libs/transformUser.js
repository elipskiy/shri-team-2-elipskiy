/*jshint -W079 */
'use strict';

module.exports = function(user) {
  return {
    userId: user.user._id.toString(),
    userName: user.user.displayName,
    userGravatar: user.user.gravatarHash,
    userColor: user.userColor,
    userCursor: user.userCursor
  };
};

'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.MSFGame =
  exports.MSFGameScore =
  exports.MSFGameSchedule =
  exports.MSFGamePlayedStatus =
    void 0;
const type_graphql_1 = require('type-graphql');
var MSFGamePlayedStatus;
(function (MSFGamePlayedStatus) {
  MSFGamePlayedStatus['UNPLAYED'] = 'UNPLAYED';
  MSFGamePlayedStatus['LIVE'] = 'LIVE';
  MSFGamePlayedStatus['COMPLETED'] = 'COMPLETED';
  MSFGamePlayedStatus['COMPLETED_PENDING_REVIEW'] = 'COMPLETED_PENDING_REVIEW';
})((MSFGamePlayedStatus = exports.MSFGamePlayedStatus || (exports.MSFGamePlayedStatus = {})));
(0, type_graphql_1.registerEnumType)(MSFGamePlayedStatus, {
  name: 'MSFGamePlayedStatus',
  description: 'Status of the game',
});
let MSFGameSchedule = class MSFGameSchedule {
  id;
  week;
  awayTeam;
  homeTeam;
  startTime; // ISO string
  endedTime;
  venueAllegiance;
  playedStatus;
};
MSFGameSchedule = __decorate([(0, type_graphql_1.ObjectType)()], MSFGameSchedule);
exports.MSFGameSchedule = MSFGameSchedule;
let MSFGameScore = class MSFGameScore {
  currentQuarter;
  currentQuarterSecondsRemaining;
  currentIntermission;
  awayScoreTotal;
  homeScoreTotal;
};
MSFGameScore = __decorate([(0, type_graphql_1.ObjectType)()], MSFGameScore);
exports.MSFGameScore = MSFGameScore;
let MSFGame = class MSFGame {
  schedule;
  score;
};
MSFGame = __decorate([(0, type_graphql_1.ObjectType)()], MSFGame);
exports.MSFGame = MSFGame;

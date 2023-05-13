"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekPicksContent = exports.getRegistrationText = exports.getDefaultSendParams = void 0;
function getDefaultSendParams(email) {
    return {
        replyToList: [
            { name: 'Bob Ambrose', email: 'bambrose24@gmail.com' },
            { name: 'Erica Ambrose', email: 'erica0ambrose@gmail.com' },
        ],
        cc: email !== 'bambrose24@gmail.com' ? 'bambrose24@gmail.com' : undefined,
    };
}
exports.getDefaultSendParams = getDefaultSendParams;
function getRegistrationText(username, season, winner, loser, score) {
    return (`Welcome to the ${season} season, <strong>${username}</strong>! You're all set.` +
        '<br/><br/>' +
        `Keep an eye out for information when we're closer to the start of the season. ` +
        `You'll only get ` +
        `emails from this system when you make picks.` +
        '<br/><br/>' +
        `Your Super Bowl pick for the 2022 season is` +
        '<br/><br/>' +
        `<strong>Winner</strong>: ${winner.abbrev || ''}` +
        '<br/>' +
        `<strong>Loser</strong>: ${loser.abbrev || ''}` +
        '<br/>' +
        `<strong>Score</strong>: ${score}` +
        '<br/>' +
        '<br/><br/>' +
        `If you have any questions, reach out to Bob at bambrose24@gmail.com ` +
        `or Erica at erica0ambrose@gmail.com.`);
}
exports.getRegistrationText = getRegistrationText;
function getWeekPicksContent({ week, season, user, games, picks, teams, }) {
    let res = `Congrats ${user.username}! You just made your picks for Week ${week}, ${season}, and ` +
        `they're saved in system. Below is a summary of your picks:`;
    res += '<br/>';
    games.forEach(g => {
        res += '<br/>';
        const pick = picks.find(p => p.gid === g.gid);
        if (!pick) {
            throw new Error('could not find pick for game when preparing picks email');
        }
        const winner = pick.winner;
        const winnerTeam = teams.find(({ teamid }) => teamid === winner);
        const loserTeam = teams.find(({ teamid }) => teamid === pick.loser);
        if (!winnerTeam || !loserTeam) {
            throw new Error('could not find winner and loser teams');
        }
        const homeTeam = winnerTeam.teamid === g.home ? winnerTeam : loserTeam;
        const awayTeam = winnerTeam.teamid === g.away ? winnerTeam : loserTeam;
        res += `  ${awayTeam.abbrev || ''} @ ${homeTeam.abbrev || ''} -- ${winnerTeam.abbrev || ''}`;
        if (pick.score) {
            res += ` (total score ${pick.score})`;
        }
    });
    res += '<br/><br/>';
    res += 'If you have any questions, reach out to Bob at bambrose24@gmail.com';
    res += '<br/>';
    res += ' - Funtime System';
    return res;
}
exports.getWeekPicksContent = getWeekPicksContent;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.DEFAULT_ROLE = exports.LEAGUE_ID = exports.SEASON = void 0;
const datastore_1 = __importDefault(require("../../../../src/datastore"));
exports.SEASON = 2022;
exports.LEAGUE_ID = 7;
exports.DEFAULT_ROLE = "player";
async function register(parent, input, context) {
    const { firstName, lastName, email, username, previousUserId } = input;
    let user = null;
    if (previousUserId) {
        user = await datastore_1.default.people.findUnique({
            where: { uid: previousUserId },
        });
        if (!user) {
            throw new Error(`Could not find a user with ID ${previousUserId}`);
        }
    }
    else {
        user = await datastore_1.default.people.findFirst({
            where: {
                email,
                season: 2021,
            },
        });
        if (!user) {
            user = await datastore_1.default.people.create({
                data: {
                    fname: firstName,
                    lname: lastName,
                    username,
                    email,
                    season: 2022,
                },
            });
        }
        if (!user) {
            throw new Error(`Error creating a new user`);
        }
    }
    const membership = await datastore_1.default.leagueMembers.create({
        data: {
            league_id: exports.LEAGUE_ID,
            user_id: user.uid,
            role: exports.DEFAULT_ROLE,
        },
    });
    if (!membership) {
        throw new Error(`Error making league membership`);
    }
    return { success: true, user, membership };
}
exports.register = register;

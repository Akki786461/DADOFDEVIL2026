const UsersModel = require('../database/models/users');

class UsersController {
  constructor(api) {
    this.api = api;
  }

  async getNameUser(userID) {
    try {
      const cached = UsersModel.getName(userID);
      if (cached && cached !== 'Unknown') return cached;
      
      const info = await this.api.getUserInfo(userID);
      if (info && info[userID]) {
        const name = info[userID].name;
        UsersModel.setName(userID, name);
        return name;
      }
      return 'Unknown';
    } catch (error) {
      return UsersModel.getName(userID) || 'Unknown';
    }
  }

  get(userID) {
    return UsersModel.get(userID);
  }

  create(userID, name = '') {
    return UsersModel.create(userID, name);
  }

  update(userID, data) {
    return UsersModel.update(userID, data);
  }

  ban(userID, reason = '') {
    return UsersModel.ban(userID, reason);
  }

  unban(userID) {
    return UsersModel.unban(userID);
  }

  isBanned(userID) {
    return UsersModel.isBanned(userID);
  }

  getAll() {
    return UsersModel.getAll();
  }

  getBanned() {
    return UsersModel.getAll().filter(u => u.banned === 1);
  }

  getData(userID) {
    return UsersModel.getData(userID);
  }

  setData(userID, data) {
    return UsersModel.setData(userID, data);
  }
}

module.exports = UsersController;

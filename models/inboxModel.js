const { DataTypes, Model } = require('sequelize');
const db = require('../config/database');
const User = require('./userModel');

class Inbox extends Model {
  toJSON() {
    return { ...this.get(), userId: undefined, sendTo: undefined, active: undefined }
  };

  readMessage() {
    this.set('isViewed', true);
  };

  isMessageRead() {
    return this.get('isViewed')
  };

  deleteBySender() {
    this.set('active', { ...this.get('active'), sender: false });
  };

  deleteByReceiver() {
    this.set('active', { ...this.get('active'), receiver: false });
  };

  isInActive() {
    if (!this.get('active').sender && !this.get('active').receiver) return true;
    return false;
  }
};

Inbox.init({
  // userId: {
  //   type: DataTypes.INTEGER,
  //   references: {
  //     model: User,
  //     key: 'id'
  //   }
  // },
  subject: {
    type: DataTypes.STRING,
    defaultValue: 'No subject'
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // sendTo: {
  //   type: DataTypes.INTEGER,
  //   references: {
  //     model: User,
  //     key: 'id'
  //   }
  // },
  active: {
    type: DataTypes.JSON,
    defaultValue: {
      sender: true,
      receiver: true
    }
  },
  isViewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize: db,
  modelName: 'inboxes',
  updatedAt: false
});

User.hasMany(Inbox);
Inbox.belongsTo(User, { foreignKey: { name: 'userId' }, as: 'SendFrom' });
Inbox.belongsTo(User, { foreignKey: { name: 'sendTo' }, as: 'SendTo' });

module.exports = Inbox;
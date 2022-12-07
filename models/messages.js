module.exports = (sequelize, DataTypes) => {
    const messages = sequelize.define('messages', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        sender: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        reciever: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        message: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
    })
    return messages;
}

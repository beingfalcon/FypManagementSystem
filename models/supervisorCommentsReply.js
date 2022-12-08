module.exports = (sequelize, DataTypes) => {
    const supervisorCommentsReply = sequelize.define('supervisorCommentsReply', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        reply: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    })
    return supervisorCommentsReply;
}

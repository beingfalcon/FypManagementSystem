module.exports = (sequelize, DataTypes) => {
    const supervisorComments = sequelize.define('supervisorComments', {
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
        comment: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
    })
    return supervisorComments;
}

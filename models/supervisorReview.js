module.exports = (sequelize, DataTypes) => {
    const supervisorReview = sequelize.define('supervisorReview', {
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
        review: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ratings:{
            type: DataTypes.INTEGER(11),
            allowNull:true,
        }
    })
    return supervisorReview;
}

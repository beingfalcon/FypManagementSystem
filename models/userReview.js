module.exports = (sequelize, DataTypes) => {
    const userComments = sequelize.define('userReview', {
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
    return userComments;
}

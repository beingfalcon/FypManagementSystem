module.exports = (sequelize,DataTypes) => {
    const Users = sequelize.define("userregs", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        fname: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        lname: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        birthday: {
            type: DataTypes.STRING(40),
            allowNull: true,
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        phone: {
            type: DataTypes.STRING(14),
            allowNull: true,
        },
        couontry: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        password: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        profilePic: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        role: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        verificationCode: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        }
    });
    return Users;
}
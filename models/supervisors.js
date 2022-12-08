module.exports = (sequelize,DataTypes) => {
    const Supervisors = sequelize.define("supervisorReg", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        dob: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING(20),
            allowNull: false,
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
        department: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        experties: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        groups: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        }
    });
    return Supervisors;
}
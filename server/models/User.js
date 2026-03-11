
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersPath = path.join(__dirname, '../db/users.json');

const User = {
  // Get all users
  getAll: () => {
    try {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      return users;
    } catch (error) {
      console.error("Error reading users:", error);
      return [];
    }
  },

  // Get user by email
  getByEmail: (email) => {
    try {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      return users.find(user => user.email && user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  },

  // Get user by ID
  getById: (id) => {
    try {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      return users.find(user => user.id === id) || null;
    } catch (error) {
      console.error("Error finding user by id:", error);
      return null;
    }
  },

  // Create new user
  create: (userData) => {
    try {
      const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      
      const emailExists = users.some(user => user.email && user.email.toLowerCase() === userData.email.toLowerCase());
      if (emailExists) {
        return null;
      }
      
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(userData.password, salt);
      
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        password: hashedPassword
      };
      
      users.push(newUser);
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  },

  // Update user
  update: (id, userData) => {
    try {
      let users = readEncrypted(USERS_FILE);
      
      const userIndex = users.findIndex(user => user.id === id);
      if (userIndex === -1) {
        return null;
      }
      
      if (userData.password) {
        const salt = bcrypt.genSaltSync(10);
        userData.password = bcrypt.hashSync(userData.password, salt);
      }
      
      users[userIndex] = { ...users[userIndex], ...userData };
      writeEncrypted(USERS_FILE, users);
      
      const { password, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  },

  // Update password
  updatePassword: (email, newPassword) => {
    try {
      let users = readEncrypted(USERS_FILE);
      
      const userIndex = users.findIndex(user => user.email && user.email.toLowerCase() === email.toLowerCase());
      if (userIndex === -1) {
        return false;
      }
      
      if (bcrypt.compareSync(newPassword, users[userIndex].password)) {
        return false;
      }
      
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);
      
      users[userIndex].password = hashedPassword;
      writeEncrypted(USERS_FILE, users);
      
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  },
  
  // Compare password
  comparePassword: (plainPassword, hashedPassword) => {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
};

module.exports = User;

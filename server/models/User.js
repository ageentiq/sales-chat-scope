const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

class User {
  constructor(db) {
    this.collection = db.collection('users');
  }

  async createUser(email, password) {
    // Check if user already exists
    const existingUser = await this.collection.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const result = await this.collection.insertOne({
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { id: result.insertedId, email };
  }

  async validateUser(email, password) {
    const user = await this.collection.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
  }
}

module.exports = User;

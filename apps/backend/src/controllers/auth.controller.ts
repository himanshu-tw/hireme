const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken.ts');

exports.register = async (req: any, res: any) => {
  try {
    const { username, email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(newUser.id);

    res.json({ token });

  } catch (err) {
    console.error(err);
  }
}

exports.signIn = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({ token });
  } catch (err) {
    console.error(err);
  }
}

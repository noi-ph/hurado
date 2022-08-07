import { AppDataSource } from 'orm/data-source';

import { User } from '../entities/users/User';

async function runSeedData() {
  let user = new User();
  const userRepository = AppDataSource.getRepository(User);

  user.username = 'Heisenberg';
  user.firstName = 'Walter';
  user.lastName = 'White';
  user.email = 'admin@admin.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = true;
  await userRepository.save(user);

  user = new User();
  user.username = 'Jesse';
  user.firstName = 'Jesse';
  user.lastName = 'Pinkman';
  user.email = 'standard@standard.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Sky';
  user.firstName = 'Skyler';
  user.lastName = 'White';
  user.email = 'skyler.white@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  // await userRepository.save(user);

  // user = new User();
  // user.username = 'Hank';
  // user.name = 'Hank Schrader';
  // user.email = 'hank.schrader@test.com';
  // user.password = 'pass1';
  // user.hashPassword();
  // await userRepository.save(user);

  // user = new User();
  // user.username = 'Marie';
  // user.name = 'Marie Schrader';
  // user.email = 'marie.schrader@test.com';
  // user.password = 'pass1';
  // user.hashPassword();
  // await userRepository.save(user);

  // user = new User();
  // user.username = 'The Lawyer';
  // user.name = 'Saul Goodman';
  // user.email = 'saul.goodman@test.com';
  // user.password = 'pass1';
  // user.hashPassword();
  // await userRepository.save(user);

  // user = new User();
  // user.username = 'Gus';
  // user.name = 'Gustavo Fring';
  // user.email = 'gustavo.fring@test.com';
  // user.password = 'pass1';
  // user.hashPassword();
  // await userRepository.save(user);

  // user = new User();
  // user.username = 'Mike';
  // user.name = 'Michael Ehrmantraut';
  // user.email = 'michael.ehrmantraut@test.com';
  // user.password = 'pass1';
  // user.hashPassword();
  // await userRepository.save(user);

  // user = new User();
  // user.username = 'Tio';
  // user.name = 'Hector Salamanca';
  // user.email = 'hector.salamanca@test.com';
  // user.password = 'pass1';
  // user.hashPassword();
  // await userRepository.save(user);

  // user = new User();
  // user.username = 'Tuco';
  // user.name = 'Alberto Salamanca';
  // user.email = 'alberto.salamanca@test.com';
  // user.password = 'pass1';
  // user.hashPassword();
  // await userRepository.save(user);
}

// runSeedData();

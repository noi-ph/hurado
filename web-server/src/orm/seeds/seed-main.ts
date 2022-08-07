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
  await userRepository.save(user);

  user = new User();
  user.username = 'Hank';
  user.firstName = 'Hank';
  user.lastName = 'Schrader';
  user.email = 'hank.schrader@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Marie';
  user.firstName = 'Marie';
  user.lastName = 'Schrader';
  user.email = 'marie.schrader@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'The Lawyer';
  user.firstName = 'Saul';
  user.lastName = 'Goodman';
  user.email = 'saul.goodman@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Gus';
  user.firstName = 'Gustavo';
  user.lastName = 'Fring';
  user.email = 'gustavo.fring@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Mike';
  user.firstName = 'Michael';
  user.lastName = 'Ehrmantraut';
  user.email = 'michael.ehrmantraut@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Tio';
  user.firstName = 'Hector';
  user.lastName = 'Salamanca';
  user.email = 'hector.salamanca@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);

  user = new User();
  user.username = 'Tuco';
  user.firstName = 'Alberto';
  user.lastName = 'Salamanca';
  user.email = 'alberto.salamanca@test.com';
  user.hashedPassword = 'pass1';
  user.hashPassword();
  user.isAdmin = false;
  await userRepository.save(user);
}

runSeedData();
